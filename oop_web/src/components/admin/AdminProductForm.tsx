import React, { useState } from "react";
import { createProduct } from "../../services/productService";

interface AdminProductFormProps {
    onCreated: () => void;
}

export const AdminProductForm: React.FC<AdminProductFormProps> = ({ onCreated }) => {
    const [name, setName] = useState("");
    const [price, setPrice] = useState<number>(0);
    const [stock, setStock] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);   // <-- new
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (name.trim() === "" || price < 0 || stock < 0) {
      setError("Invalid product data: name is required; price & stock ≥ 0.");
            return;
        }

        try {
            setLoading(true);
            await createProduct(name.trim(), price, stock);
            setName("");
            setPrice(0);
            setStock(0);
            onCreated();
        } catch (err: any) {
            console.error("Failed to create product:", err);
      setError(err.message || "Server error when creating product.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card shadow mb-4">
            <div className="card-header bg-primary text-white">
                <h3 className="h5 m-0">
                    <i className="fas fa-plus-circle mr-2"></i>
                    Create New Product
                </h3>
            </div>
            <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                        <label htmlFor="productName" className="form-label">Product Name</label>
                        <input
                            id="productName"
                            type="text"
                            className="form-control"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter product name"
                            required
                        />
                    </div>
                    <div className="row mb-3">
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="productPrice" className="form-label">Price ($)</label>
                                <input
                                    id="productPrice"
                                    type="number"
                                    className="form-control"
                                    value={price}
                                    onChange={(e) => setPrice(parseFloat(e.target.value))}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="form-group">
                                <label htmlFor="productStock" className="form-label">Stock Quantity</label>
                                <input
                                    id="productStock"
                                    type="number"
                                    className="form-control"
                                    value={stock}
                                    onChange={(e) => setStock(parseInt(e.target.value, 10))}
                                    min="0"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                    <div className="d-grid">
                        <button 
                            type="submit" 
                            className="btn btn-primary" 
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save mr-2"></i>
                                    Create Product
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
