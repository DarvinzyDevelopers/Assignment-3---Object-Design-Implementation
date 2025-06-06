// File: /oop_web/src/components/admin/AdminLayout.tsx
// ----------------------------------------------------------------

import React from "react";
import {NavLink, Routes, Route, Navigate} from "react-router-dom";
import {ProductList} from "../ProductList";

import {AdminAudit} from "./AdminAudit";
import {AdminReorders} from "./AdminReorders";
import {AdminUsers} from "./AdminUsers";
import {AdminNotifications} from "./AdminNotifications";

import {User} from "../../types";

export function AdminLayout({
                                user,
                                onLogout,
                            }: {
    user: User;
    onLogout: () => void;
}) {
    return (
        <div className="d-flex"
        style={{ height: "100vh", overflow: "hidden" }}
        >
            <aside
                className="bg-dark text-white d-flex flex-column p-0 shadow min-vh-100"
                style={{width: "280px", height: "100vh"}}
            >
                <div className="p-4 bg-dark border-bottom border-secondary">
                    <h2 className="h4 mb-0 text-primary font-weight-bold d-flex align-items-center">
                        <i className="fas fa-tachometer-alt mr-2"></i>Admin Dashboard
                    </h2>
                </div>

                <div className="p-3">
                    <div className="small text-muted mb-3 pl-2">
                        <i className="fas fa-th-large mr-1"></i>MAIN NAVIGATION
                    </div>
                    <nav className="d-flex flex-column mb-4">
                        <NavLink
                            to="/admin/audit-trail"
                            className={({isActive}) =>
                                `nav-link py-2 px-3 mb-2 rounded d-flex align-items-center ${
                                    isActive ? "active bg-primary text-white" : "text-light"
                                }`
                            }
                        >
                            <i className="fas fa-clipboard-list mr-2"></i>
                            <span>Audit Trail</span>
                        </NavLink>
                        <NavLink
                            to="/admin/reorders"
                            className={({isActive}) =>
                                `nav-link py-2 px-3 mb-2 rounded d-flex align-items-center ${
                                    isActive ? "active bg-primary text-white" : "text-light"
                                }`
                            }
                        >
                            <i className="fas fa-sync mr-2"></i>
                            <span>Reorders</span>
                        </NavLink>
                        <NavLink
                            to="/admin/users"
                            className={({isActive}) =>
                                `nav-link py-2 px-3 mb-2 rounded d-flex align-items-center ${
                                    isActive ? "active bg-primary text-white" : "text-light"
                                }`
                            }
                        >
                            <i className="fas fa-users mr-2"></i>
                            <span>Users</span>
                        </NavLink>
                        <NavLink
                            to="/admin/notifications"
                            className={({isActive}) =>
                                `nav-link py-2 px-3 mb-2 rounded d-flex align-items-center ${
                                    isActive ? "active bg-primary text-white" : "text-light"
                                }`
                            }
                        >
                            <i className="fas fa-bell mr-2"></i>
                            <span>Notifications</span>
                        </NavLink>
                        <NavLink
                            to="/admin/products"
                            className={({isActive}) =>
                                `nav-link py-2 px-3 mb-2 rounded d-flex align-items-center ${
                                    isActive ? "active bg-primary text-white" : "text-light"
                                }`
                            }
                        >
                            <i className="fas fa-box mr-2"></i>Products
                        </NavLink>
                    </nav>
                </div>

                <div
                    style={{
                        marginTop: "auto",
                        padding: "1rem",
                        // borderTop: "1px solid var(--gray-light)",
                    }}
                >
                    <div className="small mb-2">
                        <span className="font-weight-bold">{user.email}</span>
                        <br/>
                        <span className="text-muted">Administrator</span>
                    </div>

                    <button onClick={onLogout} className="btn btn-primary btn-block">
                        <i className="fas fa-sign-out-alt mr-2"></i> Logout
                    </button>
                </div>
            </aside>

            <main className="flex-grow-1 p-4 bg-light overflow-auto w-100"
            style={{ overflowY: "auto" }}>
                <div className="container-fluid pb-4">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h1 className="h3 mb-0 text-gray-800">
                            <Routes>
                                <Route path="audit-trail" element={<>Audit Trail</>}/>
                                <Route path="reorders" element={<>Reorder Requests</>}/>
                                <Route path="users" element={<>User Management</>}/>
                                <Route path="notifications" element={<>System Notifications</>}/>
                                <Route path="products" element={<>Product Management</>}/>
                                <Route path="*" element={<>Dashboard</>}/>
                            </Routes>
                        </h1>
                    </div>
                    <Routes>
                        <Route path="/" element={<Navigate to="audit-trail" replace/>}/>
                        <Route path="audit-trail" element={<AdminAudit/>}/>
                        <Route path="reorders" element={<AdminReorders/>}/>
                        <Route path="users" element={<AdminUsers/>}/>
                        <Route path="notifications" element={<AdminNotifications/>}/>
                        <Route path="products" element={<ProductList currentUserRole={user.role}/>}/>
                        <Route path="*" element={<Navigate to="audit-trail" replace/>}/>
                    </Routes>
                </div>
            </main>
        </div>
    );
}
