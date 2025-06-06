// ----------------------------------------------------------------
// File: /oop_project/oop_server/src/services/AuthController.ts
// ----------------------------------------------------------------

import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UserManager } from "./UserManager.js";
import { User } from "../domain/User.js";
import { JWT_OPTIONS, JWT_SECRET } from "../config.js";

interface JwtPayload {
    email: string;
    role: string;
    sub: string; // user.id
    iat: number;
    exp: number;
}

export class AuthController {
    private userMgr = new UserManager();

    /**
     * POST /api/auth/login
     * Expects JSON { email, password }.
     * On success, returns { token, user: { id, email, role } }.
     */
    public async login(req: Request, res: Response): Promise<void> {
        if (!req.body || typeof req.body !== "object") {
            res.status(400).json({ message: "Request body must be JSON with email & password" });
            return;
        }

        const { email, password } = req.body as { email?: string; password?: unknown };
        if (!email || typeof password !== "string") {
            res.status(400).json({ message: "Email & password (string) are required" });
            return;
        }

        try {
            // Let UserManager handle CSV lookup and bcrypt comparison
            const domainUser: User | null = await this.userMgr.validateUser(email, password);
            if (!domainUser) {
                res.status(401).json({ message: "Invalid credentials" });
                return;
            }

            const payload = {
                sub: domainUser.id,
                email: domainUser.email,
                role: domainUser.role, // either "admin" or "user"
            };

            const token = jwt.sign(payload, JWT_SECRET as jwt.Secret, JWT_OPTIONS as jwt.SignOptions);

            res.json({
                token,
                user: {
                    id: domainUser.id,
                    email: domainUser.email,
                    role: domainUser.role,
                },
            });
        } catch (err: any) {
            console.error("AuthController.login error:", err);
            res.status(500).json({ message: "Internal server error" });
        }
    }

    /**
     * Middleware to require a valid JWT in the Authorization header.
     * If valid, attaches { id, email, role } to req.user.
     */
    public requireAuth = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const authHeader = req.header("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({ message: "Authorization header missing or malformed" });
            return;
        }

        const token = authHeader.split(" ")[1];
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
            (req as any).user = {
                id: decoded.sub,
                email: decoded.email,
                role: decoded.role,
            };
            next();
        } catch (e: any) {
            console.error("JWT verify failed:", e);
            res.status(401).json({ message: "Invalid or expired token" });
        }
    };

    /**
     * Middleware to ensure that the current user is an admin.
     * Must be called after requireAuth.
     */
    public requireAdmin = (
        req: Request,
        res: Response,
        next: NextFunction
    ): void => {
        const user = (req as any).user as { role: string } | undefined;
        if (!user) {
            res.status(500).json({ message: "Internal error: no user on request" });
            return;
        }
        if (user.role !== "admin") {
            res.status(403).json({ message: "Admin privileges required" });
            return;
        }
        next();
    };
}
