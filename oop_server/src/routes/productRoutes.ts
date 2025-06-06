import express, {Request, Response} from "express";
import {ProductManager} from "../services/ProductManager.js";
import {AuthController} from "../services/AuthController.js";

export const productRouter = express.Router();
const productMgr = new ProductManager();
const authCtrl = new AuthController();

// GET /api/products
//   Optionally accept ?q=keyword to filter by name
productRouter.get("/", async (req: Request, res: Response) => {
    try {
        const q = (req.query.q as string) || "";
        let all = await productMgr.listAll();
        if (q) {
            const lower = q.toLowerCase();
            all = all.filter((p) => p.name.toLowerCase().includes(lower));
        }
        res.json(all);
        return;
    } catch (err: any) {
        console.error("Error fetching products:", err);
        res.status(500).json({message: err.message});
        return;
    }
});

// GET /api/products/:id
productRouter.get("/:id", async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const product = await productMgr.getById(id);
        res.json(product);
        return;
    } catch (err: any) {
        console.error(`Error fetching product ${req.params.id}:`, err);
        res.status(404).json({message: err.message});
        return;
    }
});

// POST /api/products
//   Body: { name, price, stockQuantity }
//   Admin only
productRouter.post(
    "/",
    authCtrl.requireAuth,
    authCtrl.requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const adminId = (req as any).user.id as string;
            const {name, price, stockQuantity} = req.body as {
                name?: string;
                price?: number;
                stockQuantity?: number;
            };
            if (!name || price === undefined || stockQuantity === undefined) {
                res
                    .status(400)
                    .json({message: "name, price, and stockQuantity are required"});
                return;
            }
            const created = await productMgr.create(adminId, name, price, stockQuantity);
            res.status(201).json(created);
            return;
        } catch (err: any) {
            console.error("Error creating product:", err);
            res.status(400).json({message: err.message});
            return;
        }
    }
);

// PATCH /api/products/:id
//   Body: { price?, stockQuantity? }
//   Admin only
productRouter.patch(
    "/:id",
    authCtrl.requireAuth,
    authCtrl.requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const adminId = (req as any).user.id as string;
            const id = req.params.id;
            const {price, stockQuantity} = req.body as {
                price?: number;
                stockQuantity?: number;
            };

            let updated: any = await productMgr.getById(id); // Start with current

            if (price !== undefined) {
                updated = await productMgr.changePrice(id, price, adminId);
            }
            if (stockQuantity !== undefined) {
                updated = await productMgr.changeStock(id, stockQuantity, adminId);
            }

            res.json(updated);
            return;
        } catch (err: any) {
            console.error(`Error updating product ${req.params.id}:`, err);
            res.status(400).json({message: err.message});
            return;
        }
    }
);

// DELETE /api/products/:id
//   Admin only
productRouter.delete(
    "/:id",
    authCtrl.requireAuth,
    authCtrl.requireAdmin,
    async (req: Request, res: Response) => {
        try {
            const adminId = (req as any).user.id as string;
            const id = req.params.id;
            await productMgr.deleteById(id, adminId);
            res.status(204).send();
            return;
        } catch (err: any) {
            console.error(`Error deleting product ${req.params.id}:`, err);
            res.status(400).json({message: err.message});
            return;
        }
    }
);
