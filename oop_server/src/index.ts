import express from "express";
import cors from "cors";
import {productRouter} from "./routes/productRoutes.js";
import {cartRouter} from "./routes/cartRoutes.js";
import {orderRouter} from "./routes/orderRoutes.js";
import {paymentRouter} from "./routes/paymentRoutes.js";
import {authRouter} from "./routes/authRoutes.js";
import {notificationRouter} from "./routes/notificationRoutes.js";
import {adminRouter} from "./routes/adminRoutes.js";

const app = express();

// Allow React client on http://localhost:3000 to talk to us
app.use(
    cors({
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PATCH", "DELETE"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

app.use(express.json());

app.get("/", (_req, res) => {
    res.json({message: "OOP Server is running!", timestamp: new Date().toISOString()});
});

// Mount API routes
app.use("/api/auth", authRouter);
app.use("/api/products", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/admin", adminRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Server is listening on http://localhost:${PORT}`);
    console.log(`📁 Health check: http://localhost:${PORT}/`);
    console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth/login`);
  console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
    console.log(`🛒 Cart API: http://localhost:${PORT}/api/cart`);
    console.log(`🧾 Orders API: http://localhost:${PORT}/api/orders`);
    console.log(`🔔 Notifications API: http://localhost:${PORT}/api/notifications`);
    console.log(`💳 Payments API: http://localhost:${PORT}/api/payments`);
  console.log(`⚙️ Admin API: http://localhost:${PORT}/api/admin/audit‐trail`);
});