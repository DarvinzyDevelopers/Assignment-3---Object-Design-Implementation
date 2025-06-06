export class Product {
    public id: string;
    public name: string;
    public price: number;
    public stockQuantity: number;

    constructor(id: string, name: string, price: number, stockQuantity: number) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.stockQuantity = stockQuantity;
    }

    /**
     * Decrement stock by `qty`. Throws if qty > stockQuantity.
     */
    public decrementStock(qty: number): void {
        if (qty > this.stockQuantity) {
            throw new Error(`Insufficient stock for product ${this.id}`);
        }
        this.stockQuantity -= qty;
    }

    /**
     * Increase stock by some amount.
     */
    public incrementStock(qty: number): void {
        this.stockQuantity += qty;
    }

    /**
     * Update the price. Must be ≥ 0.
     */
    public updatePrice(newPrice: number): void {
        if (newPrice < 0) {
            throw new Error("Price cannot be negative");
        }
        this.price = newPrice;
    }
}
