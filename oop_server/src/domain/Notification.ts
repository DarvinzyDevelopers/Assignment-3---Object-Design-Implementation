export interface Notification {
    notificationId: string; // randomUUID
    userId: string;         // id of the user to notify
    type: "LOW_STOCK" | "ORDER_PLACED" | "PRODUCT_UPDATED" | "GENERIC";
    text: string;           // human‐readable message
    seen: "true" | "false"; // store as string in CSV
    timestamp: string;      // ISO string
}
