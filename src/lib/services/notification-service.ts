import "server-only";
import { randomUUID } from "crypto";
import type { AppNotification, NotificationType } from "@/types/notification";
import { isMockMode } from "@/config/site";
import { getSupabaseServerClient, getSupabaseServiceRoleClient } from "@/lib/supabase/server";

export interface NotificationRepository {
  getForUser(userId: string): Promise<AppNotification[]>;
  markAsRead(userId: string, notificationId: string): Promise<void>;
  markAllAsRead(userId: string): Promise<void>;
}

class InMemoryNotificationStore {
  private static instance: InMemoryNotificationStore;
  notifications: AppNotification[] = [];
  private constructor() {}
  static get(): InMemoryNotificationStore {
    if (!InMemoryNotificationStore.instance) InMemoryNotificationStore.instance = new InMemoryNotificationStore();
    return InMemoryNotificationStore.instance;
  }
}

/**
 * Fire-and-forget, like recordProfileView — a failed notification write
 * should never break the booking/session/membership action that triggered
 * it. Called directly from booking-service.ts, session-service.ts, and
 * membership-service.ts at the moment each event happens.
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string
): Promise<void> {
  try {
    if (isMockMode) {
      InMemoryNotificationStore.get().notifications.unshift({
        id: randomUUID(),
        userId,
        type,
        title,
        message,
        isRead: false,
        createdAt: new Date().toISOString(),
      });
      return;
    }

    const serviceClient = getSupabaseServiceRoleClient();
    if (!serviceClient) return;
    await serviceClient.from("notifications").insert({ user_id: userId, type, title, message });
  } catch (error) {
    console.error("[createNotification]", error);
  }
}

class MockNotificationRepository implements NotificationRepository {
  async getForUser(userId: string): Promise<AppNotification[]> {
    return InMemoryNotificationStore.get().notifications.filter((n) => n.userId === userId);
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const notification = InMemoryNotificationStore.get().notifications.find(
      (n) => n.id === notificationId && n.userId === userId
    );
    if (notification) notification.isRead = true;
  }

  async markAllAsRead(userId: string): Promise<void> {
    for (const n of InMemoryNotificationStore.get().notifications) {
      if (n.userId === userId) n.isRead = true;
    }
  }
}

class SupabaseNotificationRepository implements NotificationRepository {
  async getForUser(userId: string): Promise<AppNotification[]> {
    const client = getSupabaseServerClient();
    if (!client) return [];
    const { data, error } = await client
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data ?? []).map((row) => ({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      title: row.title,
      message: row.message,
      isRead: row.is_read,
      createdAt: row.created_at,
    }));
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    const client = getSupabaseServerClient();
    if (!client) return;
    await client.from("notifications").update({ is_read: true }).eq("id", notificationId).eq("user_id", userId);
  }

  async markAllAsRead(userId: string): Promise<void> {
    const client = getSupabaseServerClient();
    if (!client) return;
    await client.from("notifications").update({ is_read: true }).eq("user_id", userId).eq("is_read", false);
  }
}

export function getNotificationRepository(): NotificationRepository {
  return isMockMode ? new MockNotificationRepository() : new SupabaseNotificationRepository();
}
