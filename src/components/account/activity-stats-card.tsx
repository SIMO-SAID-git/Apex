"use client";

import { Activity, CalendarCheck, XCircle, CalendarClock } from "lucide-react";
import { useActivityStats } from "@/hooks/queries/use-dashboard-stats";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";

export function ActivityStatsCard() {
  const { data, isLoading, isError, refetch } = useActivityStats();

  if (isLoading) return <Skeleton className="h-40 w-full rounded-2xl" />;
  if (isError) return <ErrorState message="We couldn't load your activity stats." onRetry={() => refetch()} />;

  const hasAnyActivity =
    data && (data.bookingsLast30Days > 0 || data.cancellationsLast30Days > 0 || data.classesAttended > 0 || data.upcomingBookings > 0);

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4 text-white/40" />
        <h2 className="text-base font-semibold text-white">30-day activity</h2>
      </div>

      {!hasAnyActivity ? (
        <EmptyState
          title="No activity yet"
          description="Book a class to start building your training history."
          icon={CalendarClock}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <CalendarCheck className="h-4 w-4 text-status-quiet" />
            <div>
              <p className="text-lg font-display text-white">{data?.bookingsLast30Days ?? 0}</p>
              <p className="text-xs text-white/50">New bookings</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-status-peak" />
            <div>
              <p className="text-lg font-display text-white">{data?.cancellationsLast30Days ?? 0}</p>
              <p className="text-xs text-white/50">Cancellations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent" />
            <div>
              <p className="text-lg font-display text-white">{data?.classesAttended ?? 0}</p>
              <p className="text-xs text-white/50">Classes attended</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-white/40" />
            <div>
              <p className="text-lg font-display text-white">{data?.upcomingBookings ?? 0}</p>
              <p className="text-xs text-white/50">Upcoming</p>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  );
}
