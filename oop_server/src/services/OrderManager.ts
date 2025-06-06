import {CartManager} from "./CartManager.js";
import {ProductManager} from "./ProductManager.js";
import {OrderRepoCsv} from "../repositories/OrderRepoCsv.js";
import {PaymentRepoCsv} from "../repositories/PaymentRepoCsv.js";
import {ReorderRepoCsv} from "../repositories/ReorderRepoCsv.js";
import { NotificationRepoCsv } from "../repositories/NotificationRepoCsv.js";
import { UserRepoCsv } from "../repositories/UserRepoCsv.js";

import {Order} from "../domain/Order.js";
import {OrderLineItem} from "../domain/OrderLineItem.js";
import {Payment} from "../domain/Payment.js";
import {ReorderRequest} from "../domain/ReorderRequest.js";
import {CartLineItem} from "../domain/CartLineItem.js";

import {randomUUID} from "crypto";

export class OrderManager {
    private cartMgr = new CartManager();
    private productMgr = new ProductManager();
    private orderRepo = new OrderRepoCsv();
    private paymentRepo = new PaymentRepoCsv();
    private reorderRepo = new ReorderRepoCsv();
  private notificationRepo = new NotificationRepoCsv();
  private userRepo = new UserRepoCsv();

    /**
     * 1) List all orders belonging to a given userId.
     */
    public async getOrdersForUser(userId: string): Promise<Order[]> {
        return this.orderRepo.findByUserId(userId);
    }

    /**
     * 2) Fetch one order by ID, but only if it belongs to userId.
     *    Throws "Order not found" if no such order, or "Forbidden" if it belongs to someone else.
     */
    public async getOrderById(orderId: string, userId: string): Promise<Order> {
        const order = await this.orderRepo.findById(orderId);
        if (!order) {
            throw new Error("Order not found");
        }
        if (order.userId !== userId) {
            throw new Error("Forbidden");
        }
        return order;
    }

    /**
     * 3) Fetch all payments for a given orderId—but only if that order belongs to userId.
     *    Reuses getOrderById(...) to enforce ownership.
     */
    public async getPaymentsByOrderId(
        orderId: string,
        userId: string
    ): Promise<Payment[]> {
        // Ensure the order exists and belongs to this user
        await this.getOrderById(orderId, userId);
        // Now retrieve all payments for that order
        return this.paymentRepo.findByOrderId(orderId);
    }

    /**
     * 4) Perform a full checkout for a user’s cart:
     *    • Decrement stock for each CartLineItem
     *    • Emit ReorderRequest if stock ≤ threshold
     *    • Build a new Order(...) and append to orders.csv
     *    • Build a new Payment(...) and append to payments.csv
     *    • Clear the cart (or roll back stock if anything fails)
     */
    public async checkout(
        userId: string
    ): Promise<{ order: Order; payment: Payment }> {
        // Read the user’s cart
        const cart = await this.cartMgr.getCart(userId);
        const lines: CartLineItem[] = cart.items;
        if (lines.length === 0) {
            throw new Error("Cart is empty");
        }

        // Track which (productId, qty) we have already decremented so we can roll back on failure
        const decremented: { productId: string; qty: number }[] = [];
        const reorderThreshold = 5;

        try {
            // 1) Decrement stock for each line
            for (const line of lines) {
                const updatedProduct = await this.productMgr.decrementStock(
                    line.productId,
                    line.quantity
                );
                decremented.push({productId: line.productId, qty: line.quantity});

                // 2) If stock is now ≤ threshold, log a ReorderRequest
                if (updatedProduct.stockQuantity <= reorderThreshold) {
                    const rr = new ReorderRequest(
                        randomUUID(),
                        line.productId,
                        updatedProduct.stockQuantity,
                        reorderThreshold,
                        new Date().toISOString()
                    );
                    await this.reorderRepo.append(rr);

          // Notify all admins that this product is low on stock
          const allUsers = await this.userRepo.findAll();
          const admins = allUsers.filter((u) => u.isAdmin());
          for (const admin of admins) {
            await this.notificationRepo.append({
              notificationId: randomUUID(),
              userId: admin.id,
              type: "LOW_STOCK",
              text: `Product "${updatedProduct.name}" (ID: ${line.productId}) is low on stock (remaining: ${updatedProduct.stockQuantity}).`,
              seen: "false",
              timestamp: new Date().toISOString(),
            });
          }
                }
            }

            // 3) Calculate totalAmount and build OrderLineItem[]
            let totalAmount = 0;
            const orderLines: OrderLineItem[] = [];

            for (const line of lines) {
                // Fetch the product’s unit price
                const product = await this.productMgr.getById(line.productId);
                const unitPrice = product.price;
                totalAmount += unitPrice * line.quantity;
                orderLines.push(
                    new OrderLineItem(line.productId, line.quantity, unitPrice)
                );
            }

            // 4) Create a new Order(...) and append to CSV
            const orderId = randomUUID();
            const orderDate = new Date().toISOString();
            const newOrder = new Order(
                orderId,
                userId,
                orderDate,
                orderLines,
                totalAmount,
                "PAID"
            );
            await this.orderRepo.append(newOrder);

            // 5) Create a new Payment(...) and append to CSV
            const paymentId = randomUUID();
            const paymentDate = new Date().toISOString();
            const newPayment = new Payment(
                paymentId,
                orderId,
                paymentDate,
                "STUB", // or your chosen payment method
                totalAmount,
                "PAID"
            );
            await this.paymentRepo.append(newPayment);

      // 5) Send an ORDER_PLACED notification to the user
      await this.notificationRepo.append({
        notificationId: randomUUID(),
        userId,
        type: "ORDER_PLACED",
        text: `Your order #${orderId.slice(0, 8)}… has been placed successfully.`,
        seen: "false",
        timestamp: new Date().toISOString(),
      });

            // 6) Clear the cart
            await this.cartMgr.clearCart(userId);

            return {order: newOrder, payment: newPayment};
        } catch (err) {
            // Roll back any stock decrements
            for (const d of decremented) {
                await this.productMgr.incrementStock(d.productId, d.qty);
            }
            throw err;
        }
    }
}
