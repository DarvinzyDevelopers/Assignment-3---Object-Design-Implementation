// ----------------------------------------------------------------
// File: /oop_project/oop_server/src/domain/User.ts
// ----------------------------------------------------------------

export type UserRole = "admin" | "user";

/**
 * Base class for any user in the system.  Both Admin and Client
 * inherit from this, and each sets its own role string ("admin" or "user").
 */
export abstract class User {
    public id: string;
    public email: string;
    public passwordHash: string;
    public role: UserRole;

    constructor(id: string, email: string, passwordHash: string, role: UserRole) {
        this.id = id;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
    }

    /** Returns true if this user is an administrator. */
    public isAdmin(): boolean {
        return this.role === "admin";
    }
}

/**
 * Represents an administrative user (role = "admin").
 */
export class Admin extends User {
    constructor(id: string, email: string, passwordHash: string) {
        super(id, email, passwordHash, "admin");
    }

    // Any admin-specific behavior it would go here.
}

/**
 * Represents a normal “client” user (role = "user").
 */
export class Client extends User {
    constructor(id: string, email: string, passwordHash: string) {
        super(id, email, passwordHash, "user");
    }

    // Any client-specific methods could go here.
}
