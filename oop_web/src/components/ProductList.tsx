// File: /oop_project/oop_web/src/components/ProductList.tsx
// ----------------------------------------------------------------

import React, { useState, useEffect } from "react";
import {
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../services/productService";
import { addToCart } from "../services/cartService";
import { Product, UserRole } from "../types";
import "../modern-ui.css";

interface ProductListProps {
    currentUserRole: UserRole | null;
}

export const ProductList: React.FC<ProductListProps> = ({
                                                            currentUserRole,
                                                        }) => {
    const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);       // <-- new error state
    const [search, setSearch] = useState("");
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newPrice, setNewPrice] = useState<number>(0);
    const [newStock, setNewStock] = useState<number>(0);

    // Tracks which product (by id) is currently being added to the cart
    const [loadingAdd, setLoadingAdd] = useState<string | null>(null);

    // For inline editing (admin only)
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editPrice, setEditPrice] = useState<number>(0);
    const [editStock, setEditStock] = useState<number>(0);

    const loadProducts = async () => {
        try {
            setError(null);
            const list = await fetchProducts(search.trim());
            setProducts(list);
        } catch (err: any) {
            console.error("Error fetching products:", err);
            setError("Failed to load products.");
        }
    };

    useEffect(() => {
        loadProducts();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadProducts();
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
    // Clear any existing error
    setError(null);

    // 2a) Client-side validation
        if (newName.trim() === "" || newPrice < 0 || newStock < 0) {
      setError("Invalid product data: name cannot be blank; price & stock must be ≥ 0.");
            return;
        }
        try {
            setCreating(true);
            await createProduct(newName.trim(), newPrice, newStock);
            setNewName("");
            setNewPrice(0);
            setNewStock(0);
            loadProducts();
        } catch (err: any) {
      console.error("Failed to create product:", err);
      setError(err.message || "Failed to create product. Please try again.");
        } finally {
            setCreating(false);
        }
    };

  // 3) ADD TO CART (normal users)
  const handleAddToCart = async (productId: string) => {
    setError(null);
    setLoadingAdd(productId);
    try {
      await addToCart(productId, 1);
      // Instead of an `alert`, we show a quick inline success message
      setError("Added to cart successfully!"); // Or use a separate "success" state if preferred
      setTimeout(() => setError(null), 2000);  // Clear after 2 seconds
    } catch (err: any) {
      console.error("Could not add to cart:", err);
      setError(err.message || "Could not add to cart. Please try again.");
    } finally {
      setLoadingAdd(null);
    }
  };

  // 4) UPDATE / DELETE (Admin inline editing)
    const startEditing = (p: Product) => {
        setEditingId(p.id);
        setEditPrice(p.price);
        setEditStock(p.stockQuantity);
    setError(null);
    };

    const handleUpdate = async (id: string) => {
    setError(null);
        try {
            await updateProduct(id, { price: editPrice, stockQuantity: editStock });
            setEditingId(null);
            loadProducts();
        } catch (err: any) {
      console.error("Failed to update product:", err);
      setError(err.message || "Failed to update product. Please try again.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Delete this product?")) return;
    setError(null);
        try {
            await deleteProduct(id);
            loadProducts();
        } catch (err: any) {
      console.error("Failed to delete product:", err);
      setError(err.message || "Failed to delete product. Please try again.");
        }
    };

    if (error) {
        return (
      <div className="container py-4">
        <div className="alert alert-danger">{error}</div>
            </div>
        );
    }
    if (products === null) {
        return (
            <div className="d-flex justify-content-center align-items-center p-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
                <span className="ml-3">Loading products...</span>
            </div>
        );
    }

    return (
        <div className="container py-4">
      {/* SEARCH BAR */}
            <div className="mb-5">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadProducts();
          }}
          className="d-flex"
        >
                    <div className="input-group search-input-group w-100">
                        <input
                            type="text"
                            placeholder="Search for products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="form-control search-input"
                            aria-label="Search products"
                        />
                        <div className="input-group-append">
                            <button
                                type="submit"
                                className="btn btn-primary search-button"
                            >
                                <i className="fas fa-search mr-2"></i>
                                Search
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Admin: Create New Product */}
            {currentUserRole === "admin" && (
                <div className="card shadow mb-4">
                    <div className="card-header bg-primary text-white">
                        <h3 className="h5 m-0">
                            <i className="fas fa-plus-circle mr-2"></i>
                            Create New Product
                        </h3>
                    </div>
                    <div className="card-body">
                        <form onSubmit={handleCreate}>
                            <div className="row">
                                <div className="col-md-6 col-lg-4 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="productName">
                                            <i className="fas fa-tag mr-1 text-secondary"></i>
                                            Product Name
                                        </label>
                                        <input
                                            id="productName"
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter product name"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-3 col-lg-2 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="productPrice">
                                            <i className="fas fa-dollar-sign mr-1 text-secondary"></i>
                                            Price
                                        </label>
                                        <input
                                            id="productPrice"
                                            type="number"
                                            className="form-control"
                                            placeholder="0.00"
                                            value={newPrice}
                                            onChange={(e) => setNewPrice(parseFloat(e.target.value))}
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-3 col-lg-2 mb-3">
                                    <div className="form-group">
                                        <label htmlFor="productStock">
                                            <i className="fas fa-boxes mr-1 text-secondary"></i>
                                            Stock
                                        </label>
                                        <input
                                            id="productStock"
                                            type="number"
                                            className="form-control"
                                            placeholder="0"
                                            value={newStock}
                                            onChange={(e) => setNewStock(parseInt(e.target.value, 10))}
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="col-md-12 col-lg-4 mb-3 d-flex align-items-end">
                                    <button
                                        type="submit"
                                        className="btn btn-success btn-block"
                                        disabled={creating}
                                    >
                                        {creating ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-plus-circle mr-2"></i>
                                                Create Product
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Product Grid */}
            <div className="mb-4 product-grid-container">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h3 className="h5 m-0">
                        <i className="fas fa-box mr-2 text-primary"></i>
                        Products
                    </h3>
                    <span className="badge badge-primary">{products.length} items</span>
                </div>

                {products.length === 0 ? (
                    <div className="alert alert-info">
                        <i className="fas fa-info-circle mr-2"></i>
                        No products found
                    </div>
                ) : (
                    <div className="row product-grid" style={{ display: 'flex', flexWrap: 'wrap' }}>
                        {products.map((p) => (
                            <div key={p.id} className="col-12 col-sm-6 col-md-3 col-lg-3 mb-4" style={{ flex: '0 0 25%', maxWidth: '25%', paddingLeft: '8px', paddingRight: '8px' }}>
                                <div className="card h-100 shadow-sm product-card">

                                    {/* Product Details */}
                                    <div className="card-body d-flex flex-column">
                                        <div className="card-header-icon text-center mb-3">
                                            <i className="fas fa-box fa-2x text-primary"></i>
                                        </div>
                                        <h5 className="card-title mb-3 text-center">{p.name}</h5>

                                        <div className="badge-container mb-3">
                                            <span className="badge badge-info p-2">
                                                <i className="fas fa-dollar-sign mr-1"></i>
                                                ${p.price.toFixed(2)}
                                            </span>

                                            {p.stockQuantity > 10 ? (
                                                <span className="badge badge-success p-2">
                                                    <i className="fas fa-check-circle mr-1"></i>
                                                    {p.stockQuantity} in stock
                                                </span>
                                            ) : p.stockQuantity > 0 ? (
                                                <span className="badge badge-warning p-2">
                                                    <i className="fas fa-exclamation-triangle mr-1"></i>
                                                    {p.stockQuantity} left
                                                </span>
                                            ) : (
                                                <span className="badge badge-danger p-2">
                                                    <i className="fas fa-times-circle mr-1"></i>
                                                    Out of stock
                                                </span>
                                            )}
                                        </div>

                                        {/* Admin Edit Form */}
                                        {editingId === p.id ? (
                                            <div className="mt-auto">
                                                <div className="form-group mb-2">
                                                    <label className="small">Price ($)</label>
                                                    <div className="input-group input-group-sm">
                                                        <div className="input-group-prepend">
                                                            <span className="input-group-text">$</span>
                                                        </div>
                                                        <input
                                                            type="number"
                                                            className="form-control"
                                                            value={editPrice}
                                                            onChange={(e) => setEditPrice(parseFloat(e.target.value))}
                                                            min="0"
                                                            step="0.01"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="form-group mb-3">
                                                    <label className="small">Stock</label>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        value={editStock}
                                                        onChange={(e) => setEditStock(parseInt(e.target.value, 10))}
                                                        min="0"
                                                    />
                                                </div>
                                                <div className="d-flex justify-content-between">
                                                    <button
                                                        onClick={() => handleUpdate(p.id)}
                                                        className="btn btn-success btn-sm flex-fill mr-1"
                                                    >
                                                        <i className="fas fa-save mr-1"></i>
                                                        Save
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingId(null)}
                                                        className="btn btn-light btn-sm flex-fill ml-1"
                                                    >
                                                        <i className="fas fa-times mr-1"></i>
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mt-auto">
                                                {currentUserRole === "admin" ? (
                                                    <div className="d-flex justify-content-between">
                                                        <button
                                                            onClick={() => startEditing(p)}
                                                            className="btn btn-info btn-sm flex-fill mr-1"
                                                            title="Edit product"
                                                        >
                                                            <i className="fas fa-edit mr-1"></i>
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(p.id)}
                                                            className="btn btn-danger btn-sm flex-fill ml-1"
                                                            title="Delete product"
                                                        >
                                                            <i className="fas fa-trash-alt mr-1"></i>
                                                            Delete
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => handleAddToCart(p.id)}
                                                        disabled={loadingAdd === p.id || p.stockQuantity < 1}
                                                        className="btn btn-primary btn-block"
                                                        title={p.stockQuantity < 1 ? "Out of stock" : "Add to cart"}
                                                    >
                                                        {loadingAdd === p.id ? (
                                                            <>
                                                                <span className="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
                                                                Adding...
                                                            </>
                                                        ) : p.stockQuantity < 1 ? (
                                                            <>
                                                                <i className="fas fa-ban mr-1"></i>
                                                                Out of Stock
                                                            </>
                                                        ) : (
                                                            <>
                                                                <i className="fas fa-cart-plus mr-1"></i>
                                                                Add to Cart
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};