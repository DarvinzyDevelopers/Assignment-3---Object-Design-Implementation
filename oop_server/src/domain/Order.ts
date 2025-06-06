// /oop_server/src/domain/Order.ts
import {OrderLineItem} from "./OrderLineItem.js";

export class Order {
    public orderId: string;
    public userId: string;
    public orderDate: string; // ISO string
    public items: OrderLineItem[];
    public totalAmount: number;
    public status: string;

    constructor(
        orderId: string,
        userId: string,
        orderDate: string,
        items: OrderLineItem[],
        totalAmount: number,
        status: string
    ) {
        this.orderId = orderId;
        this.userId = userId;
        this.orderDate = orderDate;
        this.items = items;
        this.totalAmount = totalAmount;
        this.status = status;
    }
}
