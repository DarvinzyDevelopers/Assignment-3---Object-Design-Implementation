// File: /oop_web/src/components/admin/AdminReorders.tsx
// ----------------------------------------------------------------

import React, { useState, useEffect } from "react";
import { axiosPrivate } from "../../services/authService";

interface ReorderRequest {
    reorderId: string;
    productId: string;
    stockQuantity: number;
    threshold: number;
    requestedAt: string;
}

export const AdminReorders: React.FC = () => {
    const [requests, setRequests] = useState<ReorderRequest[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReorders = async () => {
            try {
                setLoading(true);
                const resp = await axiosPrivate.get<ReorderRequest[]>("/admin/reorders");
                setRequests(resp.data);
            } catch (err: any) {
                console.error("Failed to load reorder requests:", err);
                setError("Unable to load reorder requests.");
            } finally {
                setLoading(false);
            }
        };
        fetchReorders();
    }, []);

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center p-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
                <span className="ml-2">Loading reorder requests...</span>
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
                    <i className="fas fa-boxes mr-2"></i>Reorder Requests
                </h2>
                {requests && <span className="badge badge-light">{requests.length} requests</span>}
            </div>
            <div className="card-body">
                {requests && requests.length === 0 ? (
                    <div className="alert alert-info text-center">
                        <i className="fas fa-info-circle mr-2"></i>No reorder requests found.
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="bg-light">
                            <tr>
                                <th>Time</th>
                                <th>Product ID</th>
                                <th>Current Stock</th>
                                <th>Threshold</th>
                                <th>Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {requests &&
                                requests.map((r) => (
                                    <tr key={r.reorderId}>
                                        <td className="text-nowrap">
                                            <i className="fas fa-clock mr-2 text-secondary"></i>
                                            {new Date(r.requestedAt).toLocaleString()}
                                        </td>
                                        <td className="text-truncate" style={{ maxWidth: "150px" }}>
                                            {r.productId}
                                        </td>
                                        <td>
                        <span
                            className={`badge ${
                                r.stockQuantity <= r.threshold ? "badge-danger" : "badge-warning"
                            }`}
                        >
                          {r.stockQuantity}
                        </span>
                                        </td>
                                        <td>{r.threshold}</td>
                                        <td>
                        <span className="badge badge-warning">
                          <i className="fas fa-exclamation-triangle mr-1"></i>Needs Reorder
                        </span>
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
