import {readCsv, writeCsv} from "../utils/csv.js";
import {CSV_PATHS} from "../config.js";
import {AuditTrailEntry} from "../domain/AuditTrailEntry.js";

export class AuditRepoCsv {
    private filePath = CSV_PATHS.auditTrail;

    /**
     * Append a single audit entry to audit_trail.csv
     */
    public async append(entry: AuditTrailEntry): Promise<void> {
        // Read existing rows (so we can re‐unparse with header)
        const existing: AuditTrailEntry[] = await readCsv<AuditTrailEntry>(this.filePath);

        // Add the new row and write back
        const toWrite = [...existing, entry];
        await writeCsv(this.filePath, toWrite);
    }

    /**
     * Read all audit entries
     */
    public async findAll(): Promise<AuditTrailEntry[]> {
        return readCsv<AuditTrailEntry>(this.filePath);
    }
}
