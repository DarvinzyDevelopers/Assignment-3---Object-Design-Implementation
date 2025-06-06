import express, {Request, Response} from "express";
import {CartManager} from "../services/CartManager.js";
import {AuthController} from "../services/AuthController.js";

export const cartRouter = express.Router();
const cartMgr = new CartManager();
const authCtrl = new AuthController();

// All cart endpoints should requireAuth (so we know which userId)
cartRouter.use(authCtrl.requireAuth);

// GET /api/cart
cartRouter.get("/", async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const cart = await cartMgr.getCart(userId);
        res.json(cart);
    } catch (err: any) {
        res.status(500).json({message: err.message});
    }
});

// POST /api/cart   { productId: string, quantity: number }
cartRouter.post("/", async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const {productId, quantity} = req.body as { productId: string; quantity: number };
        const updatedCart = await cartMgr.addToCart(userId, productId, quantity);
        res.json(updatedCart);
    } catch (err: any) {
        res.status(400).json({message: err.message});
    }
});

// PATCH /api/cart/:productId  { quantity: number }
cartRouter.patch("/:productId", async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const productId = req.params.productId;
        const {quantity} = req.body as { quantity: number };
        const updatedCart = await cartMgr.updateCartItem(userId, productId, quantity);
        res.json(updatedCart);
    } catch (err: any) {
        res.status(400).json({message: err.message});
    }
});

// DELETE /api/cart/:productId
cartRouter.delete("/:productId", async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const productId = req.params.productId;
        const updatedCart = await cartMgr.removeFromCart(userId, productId);
        res.json(updatedCart);
    } catch (err: any) {
        res.status(400).json({message: err.message});
    }
});

// DELETE /api/cart   (clear entire cart)
cartRouter.delete("/", async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        await cartMgr.clearCart(userId);
        res.status(204).send();
    } catch (err: any) {
        res.status(500).json({message: err.message});
    }
});
