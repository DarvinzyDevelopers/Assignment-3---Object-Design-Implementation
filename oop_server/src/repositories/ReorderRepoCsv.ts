import {readCsv, writeCsv} from "../utils/csv.js";
import {CSV_PATHS} from "../config.js";
import {ReorderRequest} from "../domain/ReorderRequest.js";

interface RawReorder {
    reorderId: string;
    productId: string;
    stockQuantity: string;
    threshold: string;
    requestedAt: string;
}

export class ReorderRepoCsv {
    private filePath = CSV_PATHS.reorders;

    /**
     * Append one reorder request row
     */
    public async append(rr: ReorderRequest): Promise<void> {
        const raw: RawReorder[] = await readCsv<RawReorder>(this.filePath);
        raw.push({
            reorderId: rr.reorderId,
            productId: rr.productId,
            stockQuantity: rr.stockQuantity.toString(),
            threshold: rr.threshold.toString(),
            requestedAt: rr.requestedAt,
        });
        await writeCsv(this.filePath, raw);
    }

    /**
     * Get all reorders
     */
    public async findAll(): Promise<ReorderRequest[]> {
        return readCsv<ReorderRequest>(this.filePath);
    }
}
