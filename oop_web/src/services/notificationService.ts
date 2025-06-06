import { axiosPrivate } from "./authService";
import { Notification } from "../types";

/**
 * GET /api/notifications
 */
export async function fetchNotifications(): Promise<Notification[]> {
    const response = await axiosPrivate.get<Notification[]>("/notifications");
    return response.data;
}

/**
 * PATCH /api/notifications/:id/seen
 */
export async function markNotificationAsSeen(notificationId: string): Promise<void> {
    await axiosPrivate.patch(`/notifications/${notificationId}/seen`);
}
