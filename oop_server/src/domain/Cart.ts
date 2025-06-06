// /oop_server/src/domain/Cart.ts

import {CartLineItem} from "./CartLineItem.js";

export class Cart {
    public userId: string;
    public items: CartLineItem[];

    constructor(userId: string) {
        this.userId = userId;
        this.items = [];
    }

    /**
     * Add `qty` of `productId` to the cart.
     * If the product already exists in the cart, increase its quantity.
     */
    public addItem(productId: string, qty: number): void {
        const existing = this.items.find((li) => li.productId === productId);
        if (existing) {
            existing.quantity += qty;
        } else {
            this.items.push({productId, quantity: qty});
        }
        // Optionally, you could filter out items with quantity <= 0 here.
    }

    /**
     * Update a line item's quantity to `newQty`.
     * If newQty ≤ 0, remove the line from the cart.
     */
    public updateItem(productId: string, newQty: number): void {
        const idx = this.items.findIndex((li) => li.productId === productId);
        if (idx < 0) {
            throw new Error(`Product ${productId} not in cart`);
        }
        if (newQty <= 0) {
            this.items.splice(idx, 1);
        } else {
            this.items[idx].quantity = newQty;
        }
    }

    /**
     * Remove a product from the cart entirely.
     */
    public removeItem(productId: string): void {
        this.items = this.items.filter((li) => li.productId !== productId);
    }

    /**
     * Clear all items from the cart.
     */
    public clear(): void {
        this.items = [];
    }

    /**
     * Return a deep clone of the cart (so callers don’t accidentally mutate server storage).
     */
    public clone(): Cart {
        const copy = new Cart(this.userId);
        copy.items = this.items.map((li) => ({productId: li.productId, quantity: li.quantity}));
        return copy;
    }
}
