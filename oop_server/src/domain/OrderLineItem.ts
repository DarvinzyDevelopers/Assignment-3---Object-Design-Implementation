export class OrderLineItem {
    public productId: string;
    public quantity: number;
    public unitPrice: number;

    constructor(productId: string, quantity: number, unitPrice: number) {
        this.productId = productId;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
    }
}
