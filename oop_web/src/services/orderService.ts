import { axiosPrivate } from "./authService";
import { Order, Payment } from "../types";

/**
 * GET /api/orders
 */
export async function fetchOrders(): Promise<Order[]> {
    const response = await axiosPrivate.get<Order[]>("/orders");
    return response.data;
}

/**
 * GET /api/orders/:orderId
 */
export async function fetchOrderById(orderId: string): Promise<Order> {
    const response = await axiosPrivate.get<Order>(`/orders/${orderId}`);
    return response.data;
}

/**
 * GET /api/orders/:orderId/payments
 */
export async function fetchPayments(orderId: string): Promise<Payment[]> {
    const response = await axiosPrivate.get<Payment[]>(`/orders/${orderId}/payments`);
    return response.data;
}

/**
 * POST /api/orders/checkout
 * Returns: { order, payment }
 */
export interface CheckoutResult {
    order: Order;
    payment: Payment;
}

export async function checkoutCart(): Promise<CheckoutResult> {
    const response = await axiosPrivate.post<CheckoutResult>("/orders/checkout");
    return response.data;
}
