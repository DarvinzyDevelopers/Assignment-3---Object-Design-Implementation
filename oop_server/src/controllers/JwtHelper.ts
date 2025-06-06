// File: src/controllers/JwtHelper.ts

import jwt from "jsonwebtoken";
import {JWT_SECRET, JWT_OPTIONS} from "../config.js";

export function signJwt(payload: {
    id: string;
    email: string;
    role: string;
}): string {
    return jwt.sign(
        payload,
        // “as jwt.Secret” forces the compiler to treat this string as a valid Secret
        JWT_SECRET as jwt.Secret,
        // “as jwt.SignOptions” tells TS that { expiresIn: "2h" } really is a SignOptions
        JWT_OPTIONS as jwt.SignOptions
    );
}
