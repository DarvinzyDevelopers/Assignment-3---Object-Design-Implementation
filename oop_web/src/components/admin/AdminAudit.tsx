// File: /oop_project/oop_web/src/components/admin/AdminAudit.tsx
// ----------------------------------------------------------------

import React, { useState, useEffect } from "react";
import { axiosPrivate } from "../../services/authService";

interface AuditEntry {
    auditId: string;
    timestamp: string;
    adminId: string;
    action: string;
    targetId: string;
    oldValue: string;
    newValue: string;
}

export const AdminAudit: React.FC = () => {
    const [entries, setEntries] = useState<AuditEntry[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAudit = async () => {
            try {
                setLoading(true);
                const resp = await axiosPrivate.get<AuditEntry[]>("/admin/audit-trail");
                setEntries(resp.data);
            } catch (err: any) {
                console.error("Failed to load audit trail:", err);
                setError("Unable to load audit trail.");
            } finally {
                setLoading(false);
            }
        };
        fetchAudit();
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
                <span className="ml-2">Loading audit trail...</span>
            </div>
        );
    }

    return (
        <div className="card shadow">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h2 className="h4 m-0">
                    <i className="fas fa-history mr-2"></i>
                    Audit Trail
                </h2>
                {entries && <span className="badge badge-light">{entries.length} entries</span>}
            </div>
            <div className="card-body">
                {entries && entries.length === 0 ? (
                    <div className="alert alert-info text-center">
                        <i className="fas fa-info-circle mr-2"></i>
                        No audit entries found.
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
                                        <i className="fas fa-user-shield mr-1 text-secondary"></i>
                                        Admin ID
                                    </th>
                                    <th>
                                        <i className="fas fa-tasks mr-1 text-secondary"></i>
                                        Action
                                    </th>
                                    <th>
                                        <i className="fas fa-bullseye mr-1 text-secondary"></i>
                                        Target ID
                                    </th>
                                    <th>
                                        <i className="fas fa-history mr-1 text-secondary"></i>
                                        Old Value
                                    </th>
                                    <th>
                                        <i className="fas fa-edit mr-1 text-secondary"></i>
                                        New Value
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {entries && entries.map((e) => (
                                    <tr key={e.auditId}>
                                        <td className="text-nowrap">
                                            <i className="fas fa-clock mr-2 text-secondary"></i>
                                            {new Date(e.timestamp).toLocaleString()}
                                        </td>
                                        <td className="text-truncate" style={{maxWidth: "150px"}}>{e.adminId}</td>
                                        <td>
                                            <span className={`badge ${getActionBadgeClass(e.action)}`}>
                                                <i className={`${getActionIcon(e.action)} mr-1`}></i>
                                                {e.action}
                                            </span>
                                        </td>
                                        <td className="text-truncate" style={{maxWidth: "150px"}}>{e.targetId}</td>
                                        <td className="text-monospace small text-truncate" style={{maxWidth: "200px"}}>
                                            {e.oldValue}
                                        </td>
                                        <td className="text-monospace small text-truncate" style={{maxWidth: "200px"}}>
                                            {e.newValue}
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

// Helper function to determine badge class based on action type
function getActionBadgeClass(action: string): string {
    action = action.toLowerCase();
    if (action.includes('create') || action.includes('add')) {
        return 'badge-success';
    } else if (action.includes('delete') || action.includes('remove')) {
        return 'badge-danger';
    } else if (action.includes('update') || action.includes('edit') || action.includes('modify')) {
        return 'badge-warning';
    } else {
        return 'badge-info';
    }
}

// Helper function to get icon for action type
function getActionIcon(action: string): string {
    action = action.toLowerCase();
    if (action.includes('create') || action.includes('add')) {
        return 'fas fa-plus-circle';
    } else if (action.includes('delete') || action.includes('remove')) {
        return 'fas fa-trash-alt';
    } else if (action.includes('update') || action.includes('edit') || action.includes('modify')) {
        return 'fas fa-edit';
    } else {
        return 'fas fa-info-circle';
    }
}
