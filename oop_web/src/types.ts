// AUTH / USER TYPES
export type UserRole = "admin" | "user";

export interface User {
    id: string;
    email: string;
    role: UserRole;
}

// PRODUCT TYPES
export interface Product {
    id: string;
    name: string;
    price: number;
    stockQuantity: number;
}

// CART TYPES
export interface CartLineItem {
    productId: string;
    quantity: number;
    price?: number;
    productName?: string;
}

export interface Cart {
    userId: string;
    items: CartLineItem[];
}

// ORDER & PAYMENT TYPES
export interface OrderLineItem {
    productId: string;
    quantity: number;
    unitPrice: number;
}

export interface Order {
    orderId: string;
    userId: string;
    orderDate: string; // ISO string
    items: OrderLineItem[];
    totalAmount: number;
    status: string;
}

export interface Payment {
    paymentId: string;
    orderId: string;
    paymentDate: string;
    paymentMethod: string;
    paymentAmount: number;
    status: string;
}

// NOTIFICATION TYPES
export type NotificationType = "LOW_STOCK" | "ORDER_PLACED" | "PRODUCT_UPDATED" | "GENERIC";

export interface Notification {
    notificationId: string;
    userId: string;
    type: NotificationType;
    text: string;
    seen: "true" | "false"; // stored as string in CSV
    timestamp: string;      // ISO string
}
