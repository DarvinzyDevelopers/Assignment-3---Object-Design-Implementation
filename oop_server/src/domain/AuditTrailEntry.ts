export interface AuditTrailEntry {
    auditId: string;       // randomUUID
    timestamp: string;     // ISO string
    adminId: string;       // user id of admin who made the change
    action: "CREATE" | "UPDATE_PRICE" | "UPDATE_STOCK" | "DELETE";
    targetId: string;      // productId
    oldValue: string;      // stringified old value
    newValue: string;      // stringified new value
}
