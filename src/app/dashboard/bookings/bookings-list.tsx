"use client";

import { CalendarX2 } from "lucide-react";
import { useMyBookings } from "@/hooks/queries/use-my-bookings";
import { useCancelBooking } from "@/hooks/mutations/use-cancel-booking";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { formatFriendlyDate, formatTimeRange } from "@/lib/utils/dates";

export function BookingsList() {
  const { data: bookings, isLoading, isError, refetch } = useMyBookings();
  const { mutate: cancel, isPending, variables } = useCancelBooking();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return <ErrorState message="We couldn't load your bookings." onRetry={() => refetch()} />;
  }

  const active = (bookings ?? []).filter((b) => b.status !== "cancelled");

  if (active.length === 0) {
    return (
      <EmptyState
        title="No upcoming bookings"
        description="Book a class from the schedule and it will show up here."
        icon={CalendarX2}
      />
    );
  }

  return (
    <div className="space-y-3">
      {active.map((booking) => (
        <GlassCard key={booking.id} className="p-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="font-medium text-white">{booking.fitnessClass?.title ?? "Class"}</p>
            {booking.fitnessClass ? (
              <p className="text-sm text-white/50">
                {formatFriendlyDate(booking.fitnessClass.date)} ·{" "}
                {formatTimeRange(booking.fitnessClass.startTime, booking.fitnessClass.endTime)}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <Badge tone={booking.status === "confirmed" ? "success" : "warning"}>
              {booking.status === "confirmed" ? "Confirmed" : "Waitlisted"}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => cancel(booking.id)}
              isLoading={isPending && variables === booking.id}
            >
              Cancel
            </Button>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
