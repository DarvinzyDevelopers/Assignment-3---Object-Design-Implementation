import {readCsv, writeCsv} from "../utils/csv.js";
import {CSV_PATHS} from "../config.js";
import {Order} from "../domain/Order.js";
import {OrderLineItem} from "../domain/OrderLineItem.js";

interface RawOrder {
    orderId: string;
    userId: string;
    orderDate: string;
    items: string;       // JSON‐stringified array of { productId, quantity, unitPrice }
    totalAmount: string; // numeric, stored as string in CSV
    status: string;
}

export class OrderRepoCsv {
    private filePath = CSV_PATHS.orders;

    /**
     * Append a new Order to orders.csv
     */
    public async append(order: Order): Promise<void> {
        // 1. Read existing CSV rows
        const raw: RawOrder[] = await readCsv<RawOrder>(this.filePath);

        // 2. Convert each OrderLineItem[] → JSON string
        const itemsJson = JSON.stringify(
            order.items.map((li) => ({
                productId: li.productId,
                quantity: li.quantity,
                unitPrice: li.unitPrice,
            }))
        );

        // 3. Push a new CSV row
        raw.push({
            orderId: order.orderId,
            userId: order.userId,
            orderDate: order.orderDate,
            items: itemsJson,
            totalAmount: order.totalAmount.toString(),
            status: order.status,
        });

        // 4. Write all back out
        await writeCsv(this.filePath, raw);
    }

    /**
     * Fetch all Orders from CSV, returning as Order instances.
     */
    public async findAll(): Promise<Order[]> {
        const raw: RawOrder[] = await readCsv<RawOrder>(this.filePath);

        return raw.map((r) => {
            // Parse r.items JSON → array of plain objects
            const parsedItems: {
                productId: string;
                quantity: number;
                unitPrice: number;
            }[] = JSON.parse(r.items);

            // Convert each to an OrderLineItem instance
            const lineItems: OrderLineItem[] = parsedItems.map(
                (p) => new OrderLineItem(p.productId, p.quantity, p.unitPrice)
            );

            return new Order(
                r.orderId,
                r.userId,
                r.orderDate,
                lineItems,
                parseFloat(r.totalAmount),
                r.status
            );
        });
    }

    /**
     * Find a single Order by its ID. Returns null if not found.
     */
    public async findById(orderId: string): Promise<Order | null> {
        const all = await this.findAll();
        const found = all.find((o) => o.orderId === orderId);
        return found || null;
    }

    /**
     * Find all orders for a given userId.
     */
    public async findByUserId(userId: string): Promise<Order[]> {
        const all = await this.findAll();
        return all.filter((o) => o.userId === userId);
    }
}
