export type NotificationType =
  | "booking_confirmed"
  | "booking_cancelled"
  | "class_reminder"
  | "session_booked"
  | "membership_expiring"
  | "account_event";

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
