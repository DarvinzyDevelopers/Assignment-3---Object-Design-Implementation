import React, { useState, useEffect } from "react";
import { fetchOrders, checkoutCart } from "../services/orderService";
import { Order } from "../types";

export const OrderHistory: React.FC = () => {
    const [orders, setOrders] = useState<Order[] | null>(null);
  const [error, setError] = useState<string | null>(null);    // <-- new
    const [loading, setLoading] = useState(false);

    const loadOrders = async () => {
        try {
            setError(null);
            const list = await fetchOrders();
            setOrders(list);
        } catch (err: any) {
            console.error("Error loading orders:", err);
            setError("Failed to load orders.");
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    if (error) {
    return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
    }
    if (!orders) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
        <span className="ml-2">Loading orders…</span>
      </div>
    );
    }
    if (orders.length === 0) {
        return (
      <div className="container py-4">
        <div className="alert alert-info mb-3">
          You have no orders yet.
        </div>
        {/** Show an inline error if checkout fails **/}
        {error && <div className="alert alert-danger">{error}</div>}
                <button
                    onClick={async () => {
                        setLoading(true);
            setError(null);
                        try {
                            await checkoutCart();
                            await loadOrders();
                        } catch (err: any) {
              console.error("Checkout failed:", err);
              setError(err.message || "Checkout failed. Please try again.");
                        } finally {
                            setLoading(false);
                        }
                    }}
                    disabled={loading}
          className="btn btn-primary"
                >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm mr-1" role="status" />
              Processing checkout…
            </>
          ) : (
            "Checkout My Cart Now"
          )}
                </button>
            </div>
        );
    }

    return (
    <div className="container py-4">
            {orders.map((o) => (
                <div
                    key={o.orderId}
                    style={{
                        marginBottom: "1rem",
                        padding: "1rem",
                        border: "1px solid #ccc",
                        borderRadius: 4,
                    }}
                >
                    <h4>Order #{o.orderId.slice(0, 8)}…</h4>
                    <p>Date: {new Date(o.orderDate).toLocaleString()}</p>
                    <p>Status: {o.status}</p>
                    <ul>
                        {o.items.map((li) => (
                            <li key={li.productId}>
                                {li.productId} × {li.quantity} @ ${li.unitPrice.toFixed(2)}
                            </li>
                        ))}
                    </ul>
                    <p>
                        <strong>Total:</strong> ${o.totalAmount.toFixed(2)}
                    </p>
                </div>
            ))}
        </div>
    );
};
