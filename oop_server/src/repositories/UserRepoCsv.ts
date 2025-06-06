// ----------------------------------------------------------------
// File: /oop_project/oop_server/src/repositories/UserRepoCsv.ts
// ----------------------------------------------------------------

import { readCsv, writeCsv } from "../utils/csv.js";
import { CSV_PATHS } from "../config.js";
import { Admin, Client, User, UserRole } from "../domain/User.js";
import bcrypt from "bcryptjs";

interface RawUser {
    id: string;
    email: string;
    password: string; // bcrypt hash
    role: UserRole;   // "admin" or "user"
}

export class UserRepoCsv {
    private filePath = CSV_PATHS.users;

    /**
     * Reads all rows from users.csv and returns them as Admin or Client instances.
     */
    public async findAll(): Promise<User[]> {
        const raw: RawUser[] = await readCsv<RawUser>(this.filePath);

        return raw.map((r) => {
            if (r.role === "admin") {
                return new Admin(r.id, r.email, r.password);
            } else {
                return new Client(r.id, r.email, r.password);
            }
        });
    }

    /**
     * Finds a single user by email.  Returns an Admin or Client, or null if not found.
     */
    public async findByEmail(email: string): Promise<User | null> {
        const allRaw: RawUser[] = await readCsv<RawUser>(this.filePath);
        const found = allRaw.find((r) => r.email.toLowerCase() === email.toLowerCase());
        if (!found) return null;

        if (found.role === "admin") {
            return new Admin(found.id, found.email, found.password);
        } else {
            return new Client(found.id, found.email, found.password);
        }
    }

    /**
     * Inserts or updates a user row in users.csv.  If plainPassword is given, it’s hashed;
     * otherwise, uses the existing passwordHash on the User instance.
     */
    public async upsert(user: User, plainPassword?: string): Promise<void> {
        const allRaw: RawUser[] = await readCsv<RawUser>(this.filePath);
        const idx = allRaw.findIndex((r) => r.id === user.id);

        let hash = user.passwordHash;
        if (plainPassword) {
            const salt = await bcrypt.genSalt(10);
            hash = await bcrypt.hash(plainPassword, salt);
        }

        const toWrite: RawUser = {
            id: user.id,
            email: user.email,
            password: hash,
            role: user.role as UserRole, // still "admin" or "user"
        };

        if (idx >= 0) {
            allRaw[idx] = toWrite;
        } else {
            allRaw.push(toWrite);
        }

        await writeCsv(this.filePath, allRaw);
    }
}
