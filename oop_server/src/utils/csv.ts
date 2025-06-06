import { readFile, writeFile } from "fs/promises";
import Papa from "papaparse";

export async function readCsv<T = any>(filePath: string): Promise<T[]> {
    const content = await readFile(filePath, "utf8");
    return new Promise((resolve, reject) => {
        Papa.parse<T>(content, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => resolve(results.data),
            error: (error: Error, _file?: any) => {
                reject(error as unknown as Papa.ParseError);
            },
        });
    });
}

export async function writeCsv<T = any>(filePath: string, data: T[]): Promise<void> {
    const csv = Papa.unparse(data);
    await writeFile(filePath, csv, "utf8");
}
