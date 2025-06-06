// File: /oop_web/src/components/admin/AdminUsers.tsx
// ----------------------------------------------------------------

import React, { useState, useEffect } from "react";
import { axiosPrivate } from "../../services/authService";

interface UserInfo {
    id: string;
    email: string;
    role: string; // "admin" or "user"
}

export const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<UserInfo[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const resp = await axiosPrivate.get<UserInfo[]>("/admin/users");
                setUsers(resp.data);
            } catch (err: any) {
                console.error("Failed to load users:", err);
                setError("Unable to load users.");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center p-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
                <span className="ml-2">Loading users...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
            </div>
        );
    }

    return (
        <div className="card shadow">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h2 className="h4 m-0">
                    <i className="fas fa-users mr-2"></i>All Users
                </h2>
                {users && <span className="badge badge-light">{users.length} users</span>}
            </div>
            <div className="card-body">
                {users && users.length === 0 ? (
                    <div className="alert alert-info text-center">
                        <i className="fas fa-info-circle mr-2"></i>No users found.
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="bg-light">
                            <tr>
                                <th>
                                    <i className="fas fa-envelope mr-1 text-secondary"></i>Email
                                </th>
                                <th>
                                    <i className="fas fa-user-tag mr-1 text-secondary"></i>Role
                                </th>
                                <th>
                                    <i className="fas fa-fingerprint mr-1 text-secondary"></i>User ID
                                </th>
                            </tr>
                            </thead>
                            <tbody>
                            {users &&
                                users.map((u) => (
                                    <tr key={u.id}>
                                        <td>
                                            <i className="fas fa-user mr-2 text-secondary"></i>
                                            {u.email}
                                        </td>
                                        <td>
                        <span
                            className={`badge p-2 ${
                                u.role === "admin" ? "badge-primary" : "badge-secondary"
                            }`}
                        >
                          <i
                              className={`mr-1 ${
                                  u.role === "admin" ? "fas fa-crown" : "fas fa-user"
                              }`}
                          ></i>
                            {u.role.toUpperCase()}
                        </span>
                                        </td>
                                        <td className="text-monospace small">{u.id}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};
