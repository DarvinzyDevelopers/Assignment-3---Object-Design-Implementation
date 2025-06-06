// ----------------------------------------------------------------
// File: /oop_project/oop_server/src/repositories/CartRepoCsv.ts
// ----------------------------------------------------------------

import { readCsv, writeCsv } from "../utils/csv.js";
import { CSV_PATHS } from "../config.js";

/**
 * Each row in carts.csv represents one item in one user's cart.
 * Columns: clientId, productId, quantity
 */
interface RawCartLine {
    clientId: string;
    productId: string;
    quantity: string; // stored as string in CSV, but represents a number
}

export class CartRepoCsv {
    private filePath = CSV_PATHS.carts;

    /**
     * Fetches all lines for a given clientId from carts.csv.
     * Returns an array of { productId, quantity }.
     */
    public async findByClientId(
        clientId: string
    ): Promise<{ productId: string; quantity: number }[]> {
        // Read every row under { clientId, productId, quantity }
        const raw: RawCartLine[] = await readCsv<RawCartLine>(this.filePath);

        // Filter for this clientId, parse quantity as number
        return raw
            .filter((r) => r.clientId === clientId)
            .map((r) => ({
                productId: r.productId,
                quantity: parseInt(r.quantity, 10),
            }));
    }

    /**
     * Persists an entire cart for clientId.  Overwrites any existing lines
     * for that client, then writes back the combined CSV (all clients).
     */
    public async saveCart(
        clientId: string,
        items: { productId: string; quantity: number }[]
    ): Promise<void> {
        // 1) Read all existing rows from carts.csv
        const raw: RawCartLine[] = await readCsv<RawCartLine>(this.filePath);

        // 2) Remove any existing rows belonging to this clientId
        const others = raw.filter((r) => r.clientId !== clientId);

        // 3) Map our new items into RawCartLine entries
        const toAppend: RawCartLine[] = items.map((it) => ({
            clientId,
            productId: it.productId,
            quantity: it.quantity.toString(),
        }));

        // 4) Concatenate and write back
        const merged = [...others, ...toAppend];
        await writeCsv<RawCartLine>(this.filePath, merged);
    }

    /**
     * Deletes every cart line for this client.  After this, the user has no cart.
     */
    public async deleteCart(clientId: string): Promise<void> {
        const raw: RawCartLine[] = await readCsv<RawCartLine>(this.filePath);

        // Keep only rows that do NOT belong to clientId
        const remaining = raw.filter((r) => r.clientId !== clientId);
        await writeCsv<RawCartLine>(this.filePath, remaining);
    }
}
