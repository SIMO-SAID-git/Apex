"use client";

import { useState } from "react";
import { CalendarDays, CreditCard, Sparkles, History as HistoryIcon } from "lucide-react";
import { useMyBookings } from "@/hooks/queries/use-my-bookings";
import { useMembershipHistory } from "@/hooks/auth/use-membership";
import { useMySessions } from "@/hooks/queries/use-my-sessions";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { getTierConfig } from "@/config/membership";
import { formatFriendlyDate, formatTimeRange } from "@/lib/utils/dates";
import { cn } from "@/lib/utils/cn";

type Tab = "bookings" | "membership" | "sessions";

const TABS: { id: Tab; label: string; icon: typeof CalendarDays }[] = [
  { id: "bookings", label: "Bookings", icon: CalendarDays },
  { id: "membership", label: "Membership", icon: CreditCard },
  { id: "sessions", label: "1:1 Sessions", icon: Sparkles },
];

function BookingsHistoryTab() {
  const { data: bookings, isLoading, isError, refetch } = useMyBookings();

  if (isLoading) return <Skeleton className="h-48 w-full rounded-2xl" />;
  if (isError) return <ErrorState message="We couldn't load your booking history." onRetry={() => refetch()} />;
  if (!bookings || bookings.length === 0) {
    return <EmptyState title="No bookings yet" description="Your booking history will appear here once you book a class." icon={HistoryIcon} />;
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <GlassCard key={booking.id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-medium text-white">{booking.fitnessClass?.title ?? "Class"}</p>
            {booking.fitnessClass ? (
              <p className="text-sm text-white/50">
                {formatFriendlyDate(booking.fitnessClass.date)} · {formatTimeRange(booking.fitnessClass.startTime, booking.fitnessClass.endTime)}
              </p>
            ) : null}
          </div>
          <Badge tone={booking.status === "confirmed" ? "success" : booking.status === "waitlisted" ? "warning" : "danger"}>
            {booking.status}
          </Badge>
        </GlassCard>
      ))}
    </div>
  );
}

function MembershipHistoryTab() {
  const { data: events, isLoading, isError, refetch } = useMembershipHistory();

  if (isLoading) return <Skeleton className="h-48 w-full rounded-2xl" />;
  if (isError) return <ErrorState message="We couldn't load your membership history." onRetry={() => refetch()} />;
  if (!events || events.length === 0) {
    return <EmptyState title="No membership changes yet" description="Upgrades and downgrades will be logged here." icon={CreditCard} />;
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <GlassCard key={event.id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-medium text-white">
              {getTierConfig(event.fromTier).name} → {getTierConfig(event.toTier).name}
            </p>
            <p className="text-sm text-white/50">{new Date(event.createdAt).toLocaleString()}</p>
          </div>
          <Badge tone={event.direction === "upgrade" ? "success" : event.direction === "downgrade" ? "warning" : "neutral"} className="capitalize">
            {event.direction}
          </Badge>
        </GlassCard>
      ))}
    </div>
  );
}

function SessionsHistoryTab() {
  const { data: sessions, isLoading, isError, refetch } = useMySessions();

  if (isLoading) return <Skeleton className="h-48 w-full rounded-2xl" />;
  if (isError) return <ErrorState message="We couldn't load your session history." onRetry={() => refetch()} />;
  if (!sessions || sessions.length === 0) {
    return (
      <EmptyState
        title="No 1:1 sessions yet"
        description="Elite members can book 1-on-1 training sessions from any trainer's profile."
        icon={Sparkles}
      />
    );
  }

  return (
    <div className="space-y-3">
      {sessions.map((session) => (
        <GlassCard key={session.id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-medium text-white">{new Date(session.scheduledAt).toLocaleString()}</p>
            <p className="text-sm text-white/50">{session.durationMinutes} minutes</p>
          </div>
          <Badge tone={session.status === "confirmed" ? "success" : session.status === "completed" ? "neutral" : "danger"}>
            {session.status}
          </Badge>
        </GlassCard>
      ))}
    </div>
  );
}

export function HistoryTabs() {
  const [tab, setTab] = useState<Tab>("bookings");

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto no-scrollbar" role="tablist" aria-label="History category">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-sm shrink-0 transition-colors",
              tab === id ? "bg-white text-surface-950 font-medium" : "glass text-white/70 hover:text-white hover:bg-white/10"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {tab === "bookings" ? <BookingsHistoryTab /> : null}
      {tab === "membership" ? <MembershipHistoryTab /> : null}
      {tab === "sessions" ? <SessionsHistoryTab /> : null}
    </div>
  );
}
