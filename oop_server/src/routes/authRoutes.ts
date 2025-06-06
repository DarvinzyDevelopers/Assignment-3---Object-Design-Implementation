import express, {Request, Response} from "express";
import {AuthController} from "../services/AuthController.js";
import {RawUser, UserManager} from "../services/UserManager.js";
import bcrypt from "bcryptjs";
import {randomUUID} from "crypto";
import {UserRole} from "../domain/User";
import {signJwt} from "../controllers/JwtHelper.js"; // ← New import

export const authRouter = express.Router();
const authCtrl = new AuthController();
const userMgr = new UserManager();

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
authRouter.post("/login", (req: Request, res: Response) => {
    return authCtrl.login(req, res);
});

/**
 * (Optional) POST /api/auth/register
 * Body: { email, password, role? }
 *
 * On success: returns { token, user: { id, email, role } } with status 201
 */
authRouter.post("/register", async (req: Request, res: Response) => {
    try {
        const {email, password, role} = req.body as {
            email?: string;
            password?: string;
            role?: string;
        };

        // 1) Validate required fields
        if (!email || !password) {
            res.status(400).json({message: "Email & password required"});
            return;
        }
        // Check if user already exists
        const existing = await userMgr.findByEmail(email);
        if (existing) {
            res.status(400).json({message: "User already exists"});
            return;
        }
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        const userRole: UserRole = role === "admin" ? "admin" : "user";
        const newUser: RawUser = {
            id: randomUUID(),
            email,
            password: hash,
            role: userRole,
        };
        await userMgr.create(newUser);

        // 7) Sign a JWT payload that includes { id, email, role }
        const token = signJwt({
            id: newUser.id,
            email: newUser.email,
            role: newUser.role,
        });

        // 8) Respond with both token and user info (omit the hashed password)
        res.status(201).json({
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role,
            },
        });
        return;
    } catch (err: any) {
        console.error("Register error:", err);
        res.status(500).json({message: "Server error"});
        return;
    }
});

/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 *
 * Middleware `authCtrl.requireAuth` should set `req.user = { id, email, role }`
 * if token is valid. We simply echo that back.
 */
authRouter.get("/me", authCtrl.requireAuth, async (req: Request, res: Response) => {
    try {
        const user = (req as any).user as {
            id: string;
            email: string;
            role: string;
        };
        res.json(user);
        return;
    } catch (err: any) {
        console.error("Error /me:", err);
        res.status(500).json({message: "Server error"});
        return;
    }
});
