import path from "path";
import {fileURLToPath} from "url";

// __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// project root
const root = path.resolve(__dirname, "..");

export const CSV_PATHS = {
    products: path.join(root, "data", "products.csv"),
    users: path.join(root, "data", "users.csv"),
    orders: path.join(root, "data", "orders.csv"),
    payments: path.join(root, "data", "payments.csv"),
    reorders: path.join(root, "data", "reorders.csv"),
    notifications: path.join(root, "data", "notifications.csv"),
    auditTrail: path.join(root, "data", "audit_trail.csv"),
    carts: path.join(root, "data", "carts.csv"),
};

// Add these two lines:
export const JWT_SECRET = "change_this_to_a_strong_random_value";
export const JWT_OPTIONS = {
    expiresIn: "2h",
};
