import {Product} from "../domain/Product.js";
import {ProductRepoCsv} from "../repositories/ProductRepoCsv.js";
import {AuditRepoCsv} from "../repositories/AuditRepoCsv.js";
import {NotificationRepoCsv} from "../repositories/NotificationRepoCsv.js";
import {UserRepoCsv} from "../repositories/UserRepoCsv.js";
import { ReorderRepoCsv } from "../repositories/ReorderRepoCsv.js";
import { ReorderRequest } from "../domain/ReorderRequest.js";
import {randomUUID} from "crypto";

export class ProductManager {
    private repo = new ProductRepoCsv();
    private auditRepo = new AuditRepoCsv();
    private notificationRepo = new NotificationRepoCsv();
    private userRepo = new UserRepoCsv();
    private reorderRepo = new ReorderRepoCsv();
    private reorderThreshold = 5;

    public async listAll(): Promise<Product[]> {
        return this.repo.findAll();
    }

    public async getById(id: string): Promise<Product> {
        const p = await this.repo.findById(id);
        if (!p) throw new Error(`Product ${id} not found`);
        return p;
    }

    /**
     * Create a brand-new product. Admin only.
     */
    public async create(
        adminId: string,
        name: string,
        price: number,
        stockQuantity: number
    ): Promise<Product> {
        const id = randomUUID();
        const newProduct = new Product(id, name, price, stockQuantity);
        await this.repo.upsert(newProduct);

        // Audit: record creation
        await this.auditRepo.append({
            auditId: randomUUID(),
            timestamp: new Date().toISOString(),
            adminId,
            action: "CREATE",
            targetId: id,
            oldValue: "",
            newValue: JSON.stringify({name, price, stockQuantity}),
        });

        return newProduct;
    }

    /**
     * Change price for an existing product. Admin only.
     */
    public async changePrice(id: string, newPrice: number, adminId: string): Promise<Product> {
        const p = await this.getById(id);
        const oldPrice = p.price;
        p.updatePrice(newPrice);
        await this.repo.upsert(p);

        // Audit
        await this.auditRepo.append({
            auditId: randomUUID(),
            timestamp: new Date().toISOString(),
            adminId,
            action: "UPDATE_PRICE",
            targetId: id,
            oldValue: oldPrice.toString(),
            newValue: newPrice.toString(),
        });

        // Notify **all clients** that this product’s price changed
        const allUsers = await this.userRepo.findAll();
        const clients = allUsers.filter((u) => !u.isAdmin());
        for (const client of clients) {
            await this.notificationRepo.append({
                notificationId: randomUUID(),
                userId: client.id,
                type: "PRODUCT_UPDATED",
        text: `Product "${p.name}" (ID: ${id}) price changed from $${oldPrice.toFixed(
                    2
        )} to $${newPrice.toFixed(2)}.`,
                seen: "false",
                timestamp: new Date().toISOString(),
            });
        }

        return p;
    }

    /**
   * Change stock of an existing product (admin only).
   * Records an audit entry, sends low‐stock notifications to admins,
   * and, if stock ≤ threshold, also creates a reorder request.
     */
    public async changeStock(
        id: string,
        newQuantity: number,
        adminId: string
    ): Promise<Product> {
        const p = await this.getById(id);
        if (newQuantity < 0) throw new Error("Stock cannot be negative");
        const oldQty = p.stockQuantity;
        p.stockQuantity = newQuantity;
        await this.repo.upsert(p);

        // Audit
        await this.auditRepo.append({
            auditId: randomUUID(),
            timestamp: new Date().toISOString(),
            adminId,
            action: "UPDATE_STOCK",
            targetId: id,
            oldValue: oldQty.toString(),
            newValue: newQuantity.toString(),
        });

    // If stock is now at or below threshold, notify admins
    if (newQuantity <= this.reorderThreshold) {
            const allUsers = await this.userRepo.findAll();
            const admins = allUsers.filter((u) => u.isAdmin());
            for (const admin of admins) {
                await this.notificationRepo.append({
                    notificationId: randomUUID(),
                    userId: admin.id,
                    type: "LOW_STOCK",
                    text: `Product "${p.name}" (ID: ${id}) is low on stock (now: ${newQuantity}).`,
                    seen: "false",
                    timestamp: new Date().toISOString(),
                });
            }

      // Also create a reorder request so operations team can restock
      const rr = new ReorderRequest(
        randomUUID(),
        id,
        newQuantity,
        this.reorderThreshold,
        new Date().toISOString()
      );
      await this.reorderRepo.append(rr);
        }

        return p;
    }

    /**
     * Decrement stock by some qty (used at checkout). No admins involved here.
     */
    public async decrementStock(id: string, qty: number): Promise<Product> {
        const p = await this.getById(id);
        p.decrementStock(qty);
        await this.repo.upsert(p);
        return p;
    }

    /**
     * Increase stock by some amount.
     */
    public async incrementStock(id: string, qty: number): Promise<Product> {
        const p = await this.getById(id);
        p.incrementStock(qty);
        await this.repo.upsert(p);
        return p;
    }

    /**
     * Delete a product entirely. Admin only.
     */
    public async deleteById(id: string, adminId: string): Promise<void> {
        // fetch old product (for audit)
        const oldProduct = await this.repo.findById(id);
        if (!oldProduct) throw new Error(`Product ${id} not found`);

        await this.repo.deleteById(id);

        // Audit
        await this.auditRepo.append({
            auditId: randomUUID(),
            timestamp: new Date().toISOString(),
            adminId,
            action: "DELETE",
            targetId: id,
            oldValue: JSON.stringify({
                name: oldProduct.name,
                price: oldProduct.price,
                stockQuantity: oldProduct.stockQuantity,
            }),
            newValue: "",
        });

        // Notify clients that the product was removed
        const allUsers = await this.userRepo.findAll();
        const clients = allUsers.filter((u) => !u.isAdmin());
        for (const client of clients) {
            await this.notificationRepo.append({
                notificationId: randomUUID(),
                userId: client.id,
                type: "PRODUCT_UPDATED",
                text: `Product "${oldProduct.name}" (ID: ${id}) has been removed from the catalog.`,
                seen: "false",
                timestamp: new Date().toISOString(),
            });
        }
    }
}
