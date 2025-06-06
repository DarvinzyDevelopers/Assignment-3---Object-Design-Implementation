// ----------------------------------------------------------------
// File: /oop_project/oop_server/src/services/CartManager.ts
// ----------------------------------------------------------------

import { Cart } from "../domain/Cart.js";
import { ProductManager } from "./ProductManager.js";
import { CartRepoCsv } from "../repositories/CartRepoCsv.js";

export class CartManager {
    private productMgr = new ProductManager();
    private cartRepo = new CartRepoCsv();

    /**
     * Fetch the current cart for userId, build a Cart domain object,
     * and return a deep clone so callers won't mutate our storage directly.
     */
    public async getCart(userId: string): Promise<Cart> {
        // 1) Read all (productId, quantity) for this user
        const rawItems = await this.cartRepo.findByClientId(userId);

        // 2) Build a new domain Cart
        const cart = new Cart(userId);
        for (const it of rawItems) {
            cart.addItem(it.productId, it.quantity);
        }

        // 3) Return a clone
        return cart.clone();
    }

    /**
     * Add qty of productId to the user's cart.
     * Verifies that product exists and qty > 0, then persists to carts.csv.
     */
    public async addToCart(
        userId: string,
        productId: string,
        qty: number
    ): Promise<Cart> {
        if (qty <= 0) throw new Error("Quantity must be positive");

        // 1) Verify product exists
        const product = await this.productMgr.getById(productId);
        if (!product) throw new Error(`Product ${productId} not found`);

        // 2) Load existing cart lines
        const rawItems = await this.cartRepo.findByClientId(userId);

        // 3) Merge in the new item (or increment existing quantity)
        const idx = rawItems.findIndex((r) => r.productId === productId);
        if (idx >= 0) {
            rawItems[idx].quantity += qty;
        } else {
            rawItems.push({ productId, quantity: qty });
        }

        // 4) Persist back to CSV
        await this.cartRepo.saveCart(userId, rawItems);

        // 5) Return a fresh Cart instance
        const cart = new Cart(userId);
        rawItems.forEach((it) => cart.addItem(it.productId, it.quantity));
        return cart.clone();
    }

    /**
     * Update a single line item's quantity to newQty.
     * If newQty ≤ 0, remove that line entirely.
     */
    public async updateCartItem(
        userId: string,
        productId: string,
        newQty: number
    ): Promise<Cart> {
        // 1) Load existing lines
        const rawItems = await this.cartRepo.findByClientId(userId);

        // 2) Find that product
        const idx = rawItems.findIndex((r) => r.productId === productId);
        if (idx < 0) {
            throw new Error(`Product ${productId} not in cart`);
        }

        // 3) Update or remove
        if (newQty <= 0) {
            rawItems.splice(idx, 1);
        } else {
            rawItems[idx].quantity = newQty;
        }

        // 4) Persist
        await this.cartRepo.saveCart(userId, rawItems);

        // 5) Build a new Cart to return
        const cart = new Cart(userId);
        rawItems.forEach((it) => cart.addItem(it.productId, it.quantity));
        return cart.clone();
    }

    /**
     * Remove one product from the user's cart.
     */
    public async removeFromCart(
        userId: string,
        productId: string
    ): Promise<Cart> {
        const rawItems = await this.cartRepo.findByClientId(userId);

        // Filter out that product
        const filtered = rawItems.filter((r) => r.productId !== productId);

        // Persist filtered
        await this.cartRepo.saveCart(userId, filtered);

        // Return updated Cart
        const cart = new Cart(userId);
        filtered.forEach((it) => cart.addItem(it.productId, it.quantity));
        return cart.clone();
    }

    /**
     * Completely clears the user's cart.
     */
    public async clearCart(userId: string): Promise<void> {
        await this.cartRepo.deleteCart(userId);
    }
}
