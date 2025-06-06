import { axiosPrivate } from "./authService";
import { Cart } from "../types";

/**
 * GET /api/cart
 */
export async function fetchCart(): Promise<Cart> {
    const response = await axiosPrivate.get<Cart>("/cart");
    return response.data;
}

/**
 * POST /api/cart
 * Body: { productId, quantity }
 */
export async function addToCart(
    productId: string,
    quantity: number
): Promise<Cart> {
    const response = await axiosPrivate.post<Cart>("/cart", { productId, quantity });
    return response.data;
}

/**
 * PATCH /api/cart/:productId
 * Body: { quantity }
 */
export async function updateCartItem(
    productId: string,
    quantity: number
): Promise<Cart> {
    const response = await axiosPrivate.patch<Cart>(`/cart/${productId}`, { quantity });
    return response.data;
}

/**
 * DELETE /api/cart/:productId
 */
export async function removeFromCart(productId: string): Promise<Cart> {
    const response = await axiosPrivate.delete<Cart>(`/cart/${productId}`);
    return response.data;
}

/**
 * DELETE /api/cart
 */
export async function clearCart(): Promise<void> {
    await axiosPrivate.delete("/cart");
}
