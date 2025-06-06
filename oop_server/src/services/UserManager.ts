// ----------------------------------------------------------------
// File: /oop_project/oop_server/src/services/UserManager.ts
// ----------------------------------------------------------------

import { readCsv, writeCsv } from "../utils/csv.js";
import { CSV_PATHS } from "../config.js";
import bcrypt from "bcryptjs";
import { Admin, Client, User, UserRole } from "../domain/User.js";

/**
 * RawUser corresponds exactly to how each row is stored in users.csv:
 * id,email,passwordHash,role
 */
export interface RawUser {
    id: string;
    email: string;
    password: string; // bcrypt hash
    role: UserRole;   // "admin" or "user"
}

export class UserManager {
    private filePath = CSV_PATHS.users;

    /**
     * Checks email+password against users.csv.
     * Returns an Admin or Client instance if the credentials match, otherwise null.
     */
    public async validateUser(
        email: string,
        password: string
    ): Promise<User | null> {
        const all: RawUser[] = await readCsv<RawUser>(this.filePath);
        const found = all.find((u) => u.email === email);
        if (!found) return null;

        const matches = await bcrypt.compare(password, found.password);
        if (!matches) return null;

        // Instantiate the correct subclass based on the stored role
        if (found.role === "admin") {
            return new Admin(found.id, found.email, found.password);
        } else {
            return new Client(found.id, found.email, found.password);
        }
    }

    /**
     * Looks up a user by email.  If found, returns an Admin or Client.
     * Otherwise, returns null.
     */
    public async findByEmail(email: string): Promise<User | null> {
        const all: RawUser[] = await readCsv<RawUser>(this.filePath);
        const raw = all.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (!raw) return null;

        if (raw.role === "admin") {
            return new Admin(raw.id, raw.email, raw.password);
        } else {
            return new Client(raw.id, raw.email, raw.password);
        }
    }

    /**
     * Creates or overwrites a user row in users.csv.
     * If plainPassword is provided, hashes it; otherwise assumes passwordHash is already set.
     */
    public async create(user: RawUser, plainPassword?: string): Promise<void> {
        const allRaw: RawUser[] = await readCsv<RawUser>(this.filePath);
        const idx = allRaw.findIndex((r) => r.id === user.id);

        // Hash the password if we received plaintext
        let hash = user.password;
        if (plainPassword) {
            const salt = await bcrypt.genSalt(10);
            hash = await bcrypt.hash(plainPassword, salt);
        }

        const toWrite: RawUser = {
            id: user.id,
            email: user.email,
            password: hash,
            role: user.role, // still "admin" or "user"
        };

        if (idx >= 0) {
            allRaw[idx] = toWrite;
        } else {
            allRaw.push(toWrite);
        }

        await writeCsv(this.filePath, allRaw);
    }
}
