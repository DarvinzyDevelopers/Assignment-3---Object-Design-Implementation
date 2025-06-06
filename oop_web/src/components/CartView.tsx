// File: /oop_web/src/components/CartView.tsx
// ----------------------------------------------------------------

import React, { useState, useEffect } from "react";
import {
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
    clearCart,
} from "../services/cartService";
import { checkoutCart } from "../services/orderService";
import { useNavigate } from "react-router-dom";   // <-- import this
import { Cart, CartLineItem } from "../types";

export const CartView: React.FC = () => {
    const [cart, setCart] = useState<Cart | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [updatingItem, setUpdatingItem] = useState<string | null>(null);
    const [removingItem, setRemovingItem] = useState<string | null>(null);
    const [clearing, setClearing] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false); // <-- new loading state
  const navigate = useNavigate();                       // <-- hook for navigation

    // Load cart on mount
    const loadCart = async () => {
        try {
            setLoading(true);
            setError(null);
            const c = await fetchCart();
            setCart(c);
        } catch (err: any) {
            console.error("Error loading cart:", err);
            setError("Failed to load cart.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

    if (error) {
        return (
            <div className="container py-4">
                <div className="alert alert-danger">{error}</div>
            </div>
        );
    }

    if (!cart) {
        return (
            <div className="d-flex justify-content-center align-items-center p-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
                <span className="ml-2">Loading cart...</span>
            </div>
        );
    }

    if (cart.items.length === 0) {
        return (
            <div className="container py-4">
                <div className="card shadow">
                    <div className="card-header bg-primary text-white">
                        <h2 className="m-0">Your Cart</h2>
                    </div>
                    <div className="card-body text-center p-4">
                        <div className="alert alert-info mb-0">Your cart is empty.</div>
                    </div>
                </div>
            </div>
        );
    }

    // Handler to change quantity
    const onQuantityChange = async (productId: string, newQty: number) => {
        if (newQty <= 0) {
            onRemove(productId);
            return;
        }
        try {
            setUpdatingItem(productId);
            const updated = await updateCartItem(productId, newQty);
            setCart(updated);
        } catch (err: any) {
            setError(err.message || "Could not update that item.");
        } finally {
            setUpdatingItem(null);
        }
    };

    // Handler to remove a single item
    const onRemove = async (productId: string) => {
        try {
            setRemovingItem(productId);
            const updated = await removeFromCart(productId);
            setCart(updated);
        } catch (err: any) {
            setError(err.message || "Could not remove that item.");
        } finally {
            setRemovingItem(null);
        }
    };

    // Handler to clear entire cart
    const onClear = async () => {
        if (!window.confirm("Are you sure you want to clear your entire cart?")) {
            return;
        }
        try {
            setClearing(true);
            await clearCart();
            setCart({ userId: cart.userId, items: [] });
        } catch (err: any) {
            setError("Could not clear cart.");
        } finally {
            setClearing(false);
        }
    };

  // **NEW** Handler to perform checkout
  const onCheckout = async () => {
    if (!window.confirm("Proceed to checkout?")) {
      return;
    }

    try {
      setCheckingOut(true);
      setError(null);

      // Call the backend endpoint POST /api/orders/checkout
      const { order, payment } = await checkoutCart();

      // On success, navigate the user to Order History (or a “Thank You” page)
      // and reload cart (which should now be empty).
      navigate("/orders", { replace: true });
    } catch (err: any) {
      // The backend returns 400 { message: "Cart is empty" } if cart was empty
      console.error("Checkout failed:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Checkout failed. Please try again.");
      }
    } finally {
      setCheckingOut(false);
    }
    };

    return (
        <div className="container py-4">
            <div className="card shadow">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                    <h2 className="m-0">Your Cart</h2>
                    <button
                        onClick={onClear}
            disabled={clearing || checkingOut}
                        className="btn btn-danger btn-sm"
                    >
                        {clearing ? (
                            <>
                <span
                    className="spinner-border spinner-border-sm mr-1"
                    role="status"
                    aria-hidden="true"
                ></span>
                                Clearing...
                            </>
                        ) : (
                            "Clear Cart"
                        )}
                    </button>
                </div>
                <div className="card-body">
                    <div className="list-group">
                        {cart.items.map((li: CartLineItem) => (
                            <div
                                key={li.productId}
                                className="list-group-item d-flex justify-content-between align-items-center p-3"
                            >
                                <div>
                                    <h5 className="mb-1">Product ID: {li.productId}</h5>
                                    <small className="text-muted">Quantity:</small>
                                </div>
                                <div className="d-flex align-items-center">
                                    <div className="input-group mr-3" style={{ width: "120px" }}>
                                        <input
                                            type="number"
                                            min="1"
                                            className="form-control"
                                            value={li.quantity}
                                            onChange={(e) =>
                                                onQuantityChange(li.productId, parseInt(e.target.value, 10))
                                            }
                      disabled={updatingItem === li.productId || clearing || checkingOut}
                                        />
                                        {updatingItem === li.productId && (
                                            <div className="ml-2 d-flex align-items-center">
                                                <span className="spinner-border spinner-border-sm" role="status"></span>
                                            </div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => onRemove(li.productId)}
                    disabled={removingItem === li.productId || clearing || checkingOut}
                                        className="btn btn-danger btn-sm"
                                    >
                                        {removingItem === li.productId ? (
                                            <>
                        <span
                            className="spinner-border spinner-border-sm mr-1"
                            role="status"
                        ></span>
                                                Removing...
                                            </>
                                        ) : (
                                            "Remove"
                                        )}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-4 p-3 bg-light rounded">
                        <h4 className="m-0">Total Items:</h4>
                        <h4 className="m-0 badge badge-primary p-2">
                            {cart.items.reduce((sum, item) => sum + item.quantity, 0)}
                        </h4>
                    </div>

                    <div className="text-right mt-4">
            <button
              onClick={onCheckout}
              className="btn btn-success btn-lg"
              disabled={checkingOut}
            >
              {checkingOut ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm mr-1"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Checking Out...
                </>
              ) : (
                "Proceed to Checkout"
              )}
                        </button>
                    </div>

          {/** Display any error message at the bottom **/}
          {error && (
            <div className="mt-3">
              <div className="alert alert-danger">{error}</div>
            </div>
          )}
                </div>
            </div>
        </div>
    );
};
