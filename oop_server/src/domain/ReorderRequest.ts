export class ReorderRequest {
    public reorderId: string;
    public productId: string;
    public stockQuantity: number;
    public threshold: number;
    public requestedAt: string;   // ISO string

    constructor(
        reorderId: string,
        productId: string,
        stockQuantity: number,
        threshold: number,
        requestedAt: string
    ) {
        this.reorderId = reorderId;
        this.productId = productId;
        this.stockQuantity = stockQuantity;
        this.threshold = threshold;
        this.requestedAt = requestedAt;
    }
}
