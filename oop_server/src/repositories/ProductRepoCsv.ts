import {readCsv, writeCsv} from "../utils/csv.js";
import {CSV_PATHS} from "../config.js";
import {Product} from "../domain/Product.js";

interface RawProduct {
    id: string;
    name: string;
    price: string;         // CSV fields come in as strings
    stockQuantity: string; // so we’ll parse them below
}

export class ProductRepoCsv {
    private filePath = CSV_PATHS.products;

    /**
     * Read all products from CSV, return as array of Product instances.
     */
    public async findAll(): Promise<Product[]> {
        const raw: RawProduct[] = await readCsv<RawProduct>(this.filePath);
        return raw.map((r) => new Product(r.id, r.name, parseFloat(r.price), parseInt(r.stockQuantity, 10)));
    }

    /**
     * Write the entire list of products back into CSV.
     */
    public async saveAll(products: Product[]): Promise<void> {
        // Convert Product -> plain object that papaparse can “unparse” into CSV
        const toWrite = products.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price.toString(),
            stockQuantity: p.stockQuantity.toString(),
        }));
        await writeCsv(this.filePath, toWrite);
    }

    /**
     * Fetch a single product by ID, or return null if not found.
     */
    public async findById(id: string): Promise<Product | null> {
        const all = await this.findAll();
        const found = all.find((p) => p.id === id);
        return found || null;
    }

    /**
     * Update (or insert) a product. If ID exists, replace; else, push new.
     */
    public async upsert(product: Product): Promise<void> {
        const all = await this.findAll();
        const idx = all.findIndex((p) => p.id === product.id);
        if (idx >= 0) {
            all[idx] = product;
        } else {
            all.push(product);
        }
        await this.saveAll(all);
    }

    /**
     * Delete a product by ID (or do nothing if not found)
     */
    public async deleteById(id: string): Promise<void> {
        const all = await this.findAll();
        const filtered = all.filter((p) => p.id !== id);
        if (filtered.length === all.length) {
            // nothing removed
            return;
        }
        await this.saveAll(filtered);
    }
}
