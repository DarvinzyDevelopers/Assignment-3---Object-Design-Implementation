// ----------------------------------------------------------------
// File: /oop_project/oop_server/src/routes/adminRoutes.ts
// ----------------------------------------------------------------

import express, { Request, Response } from "express";
import { AuthController } from "../services/AuthController.js";
import { AuditRepoCsv } from "../repositories/AuditRepoCsv.js";
import { ReorderRepoCsv } from "../repositories/ReorderRepoCsv.js";
import { UserRepoCsv } from "../repositories/UserRepoCsv.js";
import { NotificationRepoCsv } from "../repositories/NotificationRepoCsv.js";

export const adminRouter = express.Router();
const authCtrl = new AuthController();

// All admin routes require a valid JWT and admin privileges
adminRouter.use(authCtrl.requireAuth, authCtrl.requireAdmin);

/**
 * GET /api/admin/audit‐trail
 * Returns all rows from audit_trail.csv
 */
adminRouter.get("/audit-trail", async (_req: Request, res: Response) => {
    try {
        const auditRepo = new AuditRepoCsv();
        const entries = await auditRepo.findAll();
        res.json(entries);
    } catch (err: any) {
        console.error("Error fetching audit trail:", err);
        res.status(500).json({ message: "Failed to fetch audit trail" });
    }
});

/**
 * GET /api/admin/reorders
 * Returns all rows from reorders.csv
 */
adminRouter.get("/reorders", async (_req: Request, res: Response) => {
    try {
        const reorderRepo = new ReorderRepoCsv();
        const requests = await reorderRepo.findAll();
        res.json(requests);
    } catch (err: any) {
        console.error("Error fetching reorders:", err);
        res.status(500).json({ message: "Failed to fetch reorder requests" });
    }
});

/**
 * GET /api/admin/users
 * Returns a list of all users (id, email, role). Password hashes are omitted.
 */
adminRouter.get("/users", async (_req: Request, res: Response) => {
    try {
        const userRepo = new UserRepoCsv();
        const allUsers = await userRepo.findAll();

        // For security, don’t send the password hashes
        const safeUsers = allUsers.map((u) => ({
            id: u.id,
            email: u.email,
            role: u.role,
        }));

        res.json(safeUsers);
    } catch (err: any) {
        console.error("Error fetching users:", err);
        res.status(500).json({ message: "Failed to fetch users" });
    }
});

/**
 * GET /api/admin/notifications
 * Returns all notifications for all users.
 */
adminRouter.get("/notifications", async (_req: Request, res: Response) => {
    try {
        const noteRepo = new NotificationRepoCsv();
        const allNotes = await noteRepo.findAll(); // assume findAll exists or just do readCsv inside
        res.json(allNotes);
    } catch (err: any) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
});
