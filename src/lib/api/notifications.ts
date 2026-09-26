import { apiRequest } from "@/lib/api/client";
import type { AppNotification } from "@/types/notification";

export async function fetchNotifications(): Promise<AppNotification[]> {
  const data = await apiRequest<{ notifications: AppNotification[] }>("/api/notifications");
  return data.notifications;
}

export async function markNotificationRead(id: string): Promise<void> {
  await apiRequest(`/api/notifications/${id}/read`, { method: "POST", parseJson: false });
}

export async function markAllNotificationsRead(): Promise<void> {
  await apiRequest("/api/notifications/read-all", { method: "POST", parseJson: false });
}
