import {readCsv, writeCsv} from "../utils/csv.js";
import {CSV_PATHS} from "../config.js";
import {Payment} from "../domain/Payment.js";

interface RawPayment {
    paymentId: string;
    orderId: string;
    paymentDate: string;    // ISO string
    paymentMethod: string;  // same as domain
    paymentAmount: string;  // stored as string in CSV
    status: string;
}

export class PaymentRepoCsv {
    private filePath = CSV_PATHS.payments;

    /**
     * Append a new Payment to payments.csv
     */
    public async append(payment: Payment): Promise<void> {
        // 1. Read existing CSV rows
        const raw: RawPayment[] = await readCsv<RawPayment>(this.filePath);

        // 2. Push a new row, converting numeric → string
        raw.push({
            paymentId: payment.paymentId,
            orderId: payment.orderId,
            paymentDate: payment.paymentDate,
            paymentMethod: payment.paymentMethod,
            paymentAmount: payment.paymentAmount.toString(),
            status: payment.status,
        });

        // 3. Write back out
        await writeCsv(this.filePath, raw);
    }

    /**
     * Fetch all Payments from CSV, returning as Payment instances.
     */
    public async findAll(): Promise<Payment[]> {
        const raw: RawPayment[] = await readCsv<RawPayment>(this.filePath);

        return raw.map((r) => {
            return new Payment(
                r.paymentId,
                r.orderId,
                r.paymentDate,
                r.paymentMethod,
                parseFloat(r.paymentAmount),
                r.status
            );
        });
    }

    /**
     * Find all payments for a given orderId
     */
    public async findByOrderId(orderId: string): Promise<Payment[]> {
        const all = await this.findAll();
        return all.filter((p) => p.orderId === orderId);
    }

    /**
     * (Optional) Find a single payment by its ID
     */
    public async findById(paymentId: string): Promise<Payment | null> {
        const all = await this.findAll();
        const found = all.find((p) => p.paymentId === paymentId);
        return found || null;
    }
}
