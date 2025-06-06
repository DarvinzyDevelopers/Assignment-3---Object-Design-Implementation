import {readCsv, writeCsv} from "../utils/csv.js";
import {CSV_PATHS} from "../config.js";
import {Notification} from "../domain/Notification.js";

export class NotificationRepoCsv {
    private filePath = CSV_PATHS.notifications;

    /**
     * Append a notification
     */
    public async append(note: Notification): Promise<void> {
        const existing: Notification[] = await readCsv<Notification>(this.filePath);
        const toWrite = [...existing, note];
        await writeCsv(this.filePath, toWrite);
    }

    /**
     * Find all notifications for a given userId
     */
    public async findByUserId(userId: string): Promise<Notification[]> {
        const all = await readCsv<Notification>(this.filePath);
        return all.filter((n) => n.userId === userId);
    }

    /**
     * Mark a notification as seen (update its `seen` field)
     */
    public async markAsSeen(notificationId: string): Promise<void> {
        const all: Notification[] = await readCsv<Notification>(this.filePath);
        const idx = all.findIndex((n) => n.notificationId === notificationId);
        if (idx < 0) return;
        all[idx].seen = "true";
        await writeCsv(this.filePath, all);
    }

      /**
   * Return every notification row, regardless of userId.
   */
  public async findAll(): Promise<Notification[]> {
    return readCsv<Notification>(this.filePath);
  }
}
