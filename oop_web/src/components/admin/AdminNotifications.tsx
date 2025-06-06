// File: /oop_project/oop_web/src/components/admin/AdminNotifications.tsx
// ----------------------------------------------------------------

import React, { useState, useEffect } from "react";
import { axiosPrivate } from "../../services/authService";

interface NotificationInfo {
    notificationId: string;
    userId: string;
    type: string;
    text: string;
    seen: "true" | "false";
    timestamp: string;
}

export const AdminNotifications: React.FC = () => {
    const [notes, setNotes] = useState<NotificationInfo[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotes = async () => {
            try {
                setLoading(true);
                const resp = await axiosPrivate.get<NotificationInfo[]>("/admin/notifications");
                setNotes(resp.data);
            } catch (err: any) {
                console.error("Failed to load notifications:", err);
                setError("Unable to load notifications.");
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, []);

    if (error) {
        return (
            <div className="alert alert-danger">
                <i className="fas fa-exclamation-circle mr-2"></i>
                {error}
            </div>
        );
    }
    
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center p-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
                <span className="ml-2">Loading notifications...</span>
            </div>
        );
    }

    return (
        <div className="card shadow">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h2 className="h4 m-0">
                    <i className="fas fa-bell mr-2"></i>
                    All Notifications
                </h2>
                {notes && <span className="badge badge-light">{notes.length} notifications</span>}
            </div>
            <div className="card-body">
                {notes && notes.length === 0 ? (
                    <div className="alert alert-info text-center">
                        <i className="fas fa-info-circle mr-2"></i>
                        No notifications found.
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover">
                            <thead className="bg-light">
                                <tr>
                                    <th>
                                        <i className="fas fa-clock mr-1 text-secondary"></i>
                                        Time
                                    </th>
                                    <th>
                                        <i className="fas fa-user mr-1 text-secondary"></i>
                                        User ID
                                    </th>
                                    <th>
                                        <i className="fas fa-tag mr-1 text-secondary"></i>
                                        Type
                                    </th>
                                    <th>
                                        <i className="fas fa-comment mr-1 text-secondary"></i>
                                        Text
                                    </th>
                                    <th>
                                        <i className="fas fa-eye mr-1 text-secondary"></i>
                                        Status
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {notes && notes.map((n) => (
                                    <tr key={n.notificationId}>
                                        <td className="text-nowrap">
                                            <i className="fas fa-clock mr-2 text-secondary"></i>
                                            {new Date(n.timestamp).toLocaleString()}
                                        </td>
                                        <td className="text-truncate" style={{maxWidth: "150px"}}>{n.userId}</td>
                                        <td>
                                            <span className={`badge ${getNotificationTypeBadge(n.type)}`}>
                                                <i className={`${getNotificationTypeIcon(n.type)} mr-1`}></i>
                                                {n.type}
                                            </span>
                                        </td>
                                        <td className="text-truncate" style={{maxWidth: "300px"}}>{n.text}</td>
                                        <td>
                                            {n.seen === "true" ? (
                                                <span className="badge badge-success">
                                                    <i className="fas fa-check mr-1"></i>
                                                    Seen
                                                </span>
                                            ) : (
                                                <span className="badge badge-warning">
                                                    <i className="fas fa-eye-slash mr-1"></i>
                                                    Unseen
                                                </span>
                                            )}
                                        </td>
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

// Helper function to determine badge color based on notification type
const getNotificationTypeBadge = (type: string): string => {
    switch (type.toLowerCase()) {
        case "order":
            return "badge-primary";
        case "payment":
            return "badge-success";
        case "alert":
            return "badge-danger";
        case "system":
            return "badge-dark";
        default:
            return "badge-info";
    }
};

// Helper function to get icon for notification type
const getNotificationTypeIcon = (type: string): string => {
    switch (type.toLowerCase()) {
        case "order":
            return "fas fa-shopping-cart";
        case "payment":
            return "fas fa-credit-card";
        case "alert":
            return "fas fa-exclamation-triangle";
        case "system":
            return "fas fa-cogs";
        default:
            return "fas fa-bell";
    }
};
