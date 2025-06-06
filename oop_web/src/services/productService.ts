import { axiosPrivate } from "./authService";
import { Product } from "../types";

/**
 * GET /api/products?q=keyword
 */
export async function fetchProducts(q: string = ""): Promise<Product[]> {
    const response = await axiosPrivate.get<Product[]>("/products", {
        params: { q },
    });
    return response.data;
}

/**
 * GET /api/products/:id
 */
export async function fetchProductById(id: string): Promise<Product> {
    const response = await axiosPrivate.get<Product>(`/products/${id}`);
    return response.data;
}

/**
 * POST /api/products
 * Body: { name, price, stockQuantity }
 * Admin only
 */
export async function createProduct(
    name: string,
    price: number,
    stockQuantity: number
): Promise<Product> {
    const response = await axiosPrivate.post<Product>("/products", {
        name,
        price,
        stockQuantity,
    });
    return response.data;
}

/**
 * PATCH /api/products/:id
 * Body: { price?, stockQuantity? }
 * Admin only
 */
export async function updateProduct(
    id: string,
    data: { price?: number; stockQuantity?: number }
): Promise<Product> {
    const response = await axiosPrivate.patch<Product>(`/products/${id}`, data);
    return response.data;
}

/**
 * DELETE /api/products/:id
 * Admin only
 */
export async function deleteProduct(id: string): Promise<void> {
    await axiosPrivate.delete(`/products/${id}`);
}
