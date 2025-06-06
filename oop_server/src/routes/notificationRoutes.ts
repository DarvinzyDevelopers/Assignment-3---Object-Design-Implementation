import express, {Request, Response} from "express";
import {AuthController} from "../services/AuthController.js";
import {NotificationRepoCsv} from "../repositories/NotificationRepoCsv.js";

export const notificationRouter = express.Router();
const authCtrl = new AuthController();
const noteRepo = new NotificationRepoCsv();

// GET /api/notifications
//   Return all notifications for current user
notificationRouter.get(
    "/",
    authCtrl.requireAuth,
    async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id as string;
            const notes = await noteRepo.findByUserId(userId);
            res.json(notes);
            return;
        } catch (err: any) {
            console.error("Error fetching notifications:", err);
            res.status(500).json({message: err.message});
            return;
        }
    }
);

// PATCH /api/notifications/:id/seen
//   Mark a notification as seen
notificationRouter.patch(
    "/:id/seen",
    authCtrl.requireAuth,
    async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id as string;
            const noteId = req.params.id;
            // Optional: verify that this notification belongs to the user
            const all = await noteRepo.findByUserId(userId);
            const target = all.find((n) => n.notificationId === noteId);
            if (!target) {
                res.status(404).json({message: "Not found"});
                return;
            }
            await noteRepo.markAsSeen(noteId);
            res.status(204).send();
            return;
        } catch (err: any) {
            console.error("Error marking notification seen:", err);
            res.status(500).json({message: err.message});
            return;
        }
    }
);
