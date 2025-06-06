// File: /oop_web/src/components/NotificationList.tsx
// ----------------------------------------------------------------

import React, { useState, useEffect } from "react";
import { fetchNotifications, markNotificationAsSeen } from "../services/notificationService";
import { Notification } from "../types";

// Helper to pick a FontAwesome icon class for each type
const getNotificationIcon = (type: string): string => {
    switch (type.toLowerCase()) {
        case "low_stock":
            return "fas fa-boxes text-warning";
        case "order_placed":
            return "fas fa-shopping-cart text-success";
        case "product_updated":
            return "fas fa-tag text-primary";
        default:
            return "fas fa-bell text-secondary";
    }
};

export const NotificationList: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);     // <-- new
    const [markingId, setMarkingId] = useState<string | null>(null);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchNotifications();
            setNotifications(data);
    } catch (err: any) {
            console.error("Error loading notifications:", err);
            setError("Failed to load notifications.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadNotifications();
    }, []);

    const handleMarkAsSeen = async (notificationId: string) => {
    setError(null);
        try {
            setMarkingId(notificationId);
            await markNotificationAsSeen(notificationId);
            // Update UI locally, instead of full fetch:
            setNotifications((prev) =>
                prev.map((n) =>
                    n.notificationId === notificationId ? { ...n, seen: "true" } : n
                )
            );
    } catch (err: any) {
            console.error("Failed to mark notification as seen:", err);
      setError("Could not mark notification as seen. Please try again.");
        } finally {
            setMarkingId(null);
        }
    };

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
            <div className="container py-4">
      {error && <div className="alert alert-danger">{error}</div>}
      {notifications.length === 0 ? (
                <div className="card shadow">
                    <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                        <h3 className="m-0">
                            <i className="fas fa-bell mr-2"></i>
                            Notifications
              <span className="badge badge-light ml-2">{notifications.length}</span>
                        </h3>
                        <button onClick={loadNotifications} className="btn btn-light btn-sm">
                            <i className="fas fa-sync-alt mr-1"></i> Refresh
                        </button>
                    </div>
                    <div className="card-body text-center p-4">
                        <div className="alert alert-info mb-0">
                            <i className="fas fa-info-circle mr-2"></i>No notifications.
                        </div>
                    </div>
                </div>
      ) : (
            <div className="card shadow">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h3 className="m-0">
                        <i className="fas fa-bell mr-2"></i>
                        Notifications
                        <span className="badge badge-light ml-2">{notifications.length}</span>
                    </h3>
                    <button
                        onClick={loadNotifications}
                        className="btn btn-light btn-sm"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm mr-1" role="status" />
                                Refreshing...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-sync-alt mr-1"></i> Refresh
                            </>
                        )}
                    </button>
                </div>
                <div className="card-body p-0">
                    <div className="list-group list-group-flush">
                        {notifications.map((n) => (
                            <div
                                key={n.notificationId}
                                className={`list-group-item ${n.seen === "false" ? "bg-light" : ""}`}
                            >
                                <div className="d-flex justify-content-between align-items-start">
                                    <div>
                                        <h5 className="mb-1">
                                            <i className={`mr-2 ${getNotificationIcon(n.type)}`}></i>
                                            {n.type.replace(/_/g, " ")}
                                        </h5>
                                        <p className="mb-1">{n.text}</p>
                                        <small className="text-muted">
                                            <i className="fas fa-clock mr-1"></i>
                                            {new Date(n.timestamp).toLocaleString()}
                                        </small>
                                    </div>
                                    {n.seen === "false" && (
                                        <button
                                            onClick={() => handleMarkAsSeen(n.notificationId)}
                                            className="btn btn-outline-primary btn-sm"
                                            disabled={markingId === n.notificationId}
                                        >
                                            {markingId === n.notificationId ? (
                                                <>
                          <span
                              className="spinner-border spinner-border-sm mr-1"
                              role="status"
                              aria-hidden="true"
                          />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-check mr-1"></i>
                                                    Mark as seen
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
      )}
        </div>
    );
};
