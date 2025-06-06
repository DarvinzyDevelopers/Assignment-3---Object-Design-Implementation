export class Payment {
    public paymentId: string;
    public orderId: string;
    public paymentDate: string;    // ISO string
    public paymentMethod: string;  // e.g. "CREDIT_CARD", "STUB"
    public paymentAmount: number;  // numeric total
    public status: string;         // e.g. "PAID", "FAILED"

    constructor(
        paymentId: string,
        orderId: string,
        paymentDate: string,
        paymentMethod: string,
        paymentAmount: number,
        status: string
    ) {
        this.paymentId = paymentId;
        this.orderId = orderId;
        this.paymentDate = paymentDate;
        this.paymentMethod = paymentMethod;
        this.paymentAmount = paymentAmount;
        this.status = status;
    }
}
