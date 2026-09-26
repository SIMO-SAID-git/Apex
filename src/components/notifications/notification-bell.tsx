"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, CalendarCheck, XCircle, CalendarClock, Sparkles, AlertTriangle, Info } from "lucide-react";
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from "@/hooks/queries/use-notifications";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";
import type { AppNotification, NotificationType } from "@/types/notification";

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  booking_confirmed: CalendarCheck,
  booking_cancelled: XCircle,
  class_reminder: CalendarClock,
  session_booked: Sparkles,
  membership_expiring: AlertTriangle,
  account_event: Info,
};

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

/** Task #8: notification bell in the top nav, right beside the account
 *  dropdown — see site-header.tsx for placement. */
export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { data: notifications, isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const unreadCount = notifications?.filter((n) => !n.isRead).length ?? 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setIsOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  function handleNotificationClick(notification: AppNotification) {
    if (!notification.isRead) markRead.mutate(notification.id);
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:text-white hover:bg-white/5 transition-colors"
      >
        <Bell className="h-4.5 w-4.5" />
        {unreadCount > 0 ? (
          <span className="absolute top-1 right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-status-peak px-1 text-[10px] font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            role="dialog"
            aria-label="Notifications"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 max-h-[26rem] overflow-y-auto glass-strong rounded-2xl p-2 elevated z-50"
          >
            <div className="flex items-center justify-between px-3 py-2">
              <p className="text-sm font-medium text-white">Notifications</p>
              {unreadCount > 0 ? (
                <button
                  onClick={() => markAllRead.mutate()}
                  className="text-xs text-accent hover:underline"
                >
                  Mark all read
                </button>
              ) : null}
            </div>

            {isLoading ? (
              <div className="space-y-2 p-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : !notifications || notifications.length === 0 ? (
              <div className="p-2">
                <EmptyState title="You're all caught up" description="Booking, session, and membership updates will show up here." icon={Bell} />
              </div>
            ) : (
              <ul className="space-y-1">
                {notifications.map((notification) => {
                  const Icon = TYPE_ICON[notification.type] ?? Info;
                  return (
                    <li key={notification.id}>
                      <button
                        onClick={() => handleNotificationClick(notification)}
                        className={cn(
                          "w-full text-left flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/5",
                          !notification.isRead && "bg-white/[0.04]"
                        )}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent mt-0.5">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium text-white truncate">{notification.title}</p>
                            {!notification.isRead ? <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" aria-hidden /> : null}
                          </div>
                          <p className="text-xs text-white/60 mt-0.5">{notification.message}</p>
                          <p className="text-[11px] text-white/35 mt-1">{timeAgo(notification.createdAt)}</p>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
