"use client";

import { cn } from "@/lib/utils/cn";
import { useOccupancy } from "@/hooks/queries/use-occupancy";
import type { OccupancyStatus } from "@/types/occupancy";

const statusLabel: Record<OccupancyStatus, string> = {
  quiet: "Quiet",
  moderate: "Moderate",
  peak: "Peak",
};

const statusDotClass: Record<OccupancyStatus, string> = {
  quiet: "bg-status-quiet",
  moderate: "bg-status-moderate",
  peak: "bg-status-peak",
};

export function LiveOccupancyWidget({ compact = false }: { compact?: boolean }) {
  const { data, isLoading, isError } = useOccupancy();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-white/40" aria-live="polite">
        <span className="status-dot bg-white/20" aria-hidden />
        Loading occupancy…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex items-center gap-2 text-xs text-white/40">
        <span className="status-dot bg-white/20" aria-hidden />
        Occupancy unavailable
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center gap-2", compact ? "text-xs" : "text-sm")}
      aria-live="polite"
      role="status"
    >
      <span className="relative flex h-2 w-2" aria-hidden>
        <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75 animate-pulse-ring", statusDotClass[data.status])} />
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", statusDotClass[data.status])} />
      </span>
      <span className="text-white/80">
        <span className="font-medium text-white">{statusLabel[data.status]}</span>
        {!compact ? <span className="text-white/50"> · {data.current}/{data.capacity} on the floor</span> : null}
      </span>
    </div>
  );
}
