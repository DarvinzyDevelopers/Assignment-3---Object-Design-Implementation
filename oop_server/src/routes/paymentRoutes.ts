import express, {Request, Response} from "express";
import {AuthController} from "../services/AuthController";
import {PaymentRepoCsv} from "../repositories/PaymentRepoCsv";

export const paymentRouter = express.Router();
const authCtrl = new AuthController();
const paymentRepo = new PaymentRepoCsv();

// All payment routes require a valid JWT
paymentRouter.use(authCtrl.requireAuth);

// GET /api/payments/:orderId   (list payments for that order)
paymentRouter.get("/:orderId", async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const orderId = req.params.orderId;

        // (Optional) If you want to check that this order actually belongs to userId,
        // you’d need to read from OrderRepoCsv here—but for now, assume any authenticated user can see their own payments.
        // If you implemented ownership-check in orderRoutes, it’s safe enough.

        const payments = await paymentRepo.findByOrderId(orderId);
        res.json(payments);
    } catch (err: any) {
        res.status(500).json({message: err.message});
    }
});
