import express, {Request, Response} from "express";
import {AuthController} from "../services/AuthController.js";
import {OrderManager} from "../services/OrderManager.js";

export const orderRouter = express.Router();
const authCtrl = new AuthController();
const orderMgr = new OrderManager();

function getUserId(req: Request): string {
    const user = (req as any).user as { id: string };
    if (!user || !user.id) throw new Error("No user on request");
    return user.id;
}

// GET /api/orders
orderRouter.get(
    "/",
    authCtrl.requireAuth,
    async (req: Request, res: Response) => {
        try {
            const userId = getUserId(req);
            const orders = await orderMgr.getOrdersForUser(userId);
            res.json(orders);
            return;
        } catch (err: any) {
            console.error("Error fetching orders:", err);
            res.status(500).json({message: err.message});
            return;
        }
    }
);

// GET /api/orders/:orderId
orderRouter.get(
    "/:orderId",
    authCtrl.requireAuth,
    async (req: Request, res: Response) => {
        try {
            const userId = getUserId(req);
            const orderId = req.params.orderId;
            const order = await orderMgr.getOrderById(orderId, userId);
            res.json(order);
            return;
        } catch (err: any) {
            console.error(`Error fetching order ${req.params.orderId}:`, err);
            if (err.message === "Forbidden") {
                res.status(403).json({message: "Not your order"});
            } else {
                res.status(404).json({message: err.message});
            }
            return;
        }
    }
);

// GET /api/orders/:orderId/payments
orderRouter.get(
    "/:orderId/payments",
    authCtrl.requireAuth,
    async (req: Request, res: Response) => {
        try {
            const userId = getUserId(req);
            const orderId = req.params.orderId;
            const payments = await orderMgr.getPaymentsByOrderId(orderId, userId);
            res.json(payments);
            return;
        } catch (err: any) {
            console.error(`Error fetching payments for ${req.params.orderId}:`, err);
            if (err.message === "Forbidden") {
                res.status(403).json({message: "Not your order"});
            } else {
                res.status(404).json({message: err.message});
            }
            return;
        }
    }
);

// POST /api/orders/checkout
orderRouter.post(
    "/checkout",
    authCtrl.requireAuth,
    async (req: Request, res: Response) => {
        try {
            const userId = getUserId(req);
            const {order, payment} = await orderMgr.checkout(userId);
            res.json({order, payment});
            return;
        } catch (err: any) {
            console.error("Checkout error:", err);
            res.status(400).json({message: err.message});
            return;
        }
    }
);
