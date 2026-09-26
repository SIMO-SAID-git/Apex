"use client";

import { Eye } from "lucide-react";
import { useProfileViewStats } from "@/hooks/queries/use-dashboard-stats";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";

export function ProfileViewersCard() {
  const { data, isLoading, isError, refetch } = useProfileViewStats();

  if (isLoading) return <Skeleton className="h-28 w-full rounded-2xl" />;
  if (isError) return <ErrorState message="We couldn't load your profile view stats." onRetry={() => refetch()} />;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Eye className="h-4 w-4 text-white/40" />
        <h2 className="text-base font-semibold text-white">Profile viewers</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-2xl font-display text-white">{data?.last30DaysViews ?? 0}</p>
          <p className="text-xs text-white/50">Last 30 days</p>
        </div>
        <div>
          <p className="text-2xl font-display text-white">{data?.totalViews ?? 0}</p>
          <p className="text-xs text-white/50">All time</p>
        </div>
      </div>
    </GlassCard>
  );
}
