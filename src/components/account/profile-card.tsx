"use client";

import { useAuth } from "@/hooks/auth/use-auth";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { initialsFromName } from "@/lib/utils/formatters";

export function ProfileCard() {
  const { profile, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <GlassCard className="p-6 flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-40" />
        </div>
      </GlassCard>
    );
  }

  const displayName = profile?.displayName || user?.email || "Member";

  return (
    <GlassCard className="p-6 flex items-center gap-4">
      {profile?.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={profile.avatarUrl} alt="" className="h-16 w-16 rounded-full object-cover" />
      ) : (
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent text-lg font-medium">
          {initialsFromName(displayName)}
        </span>
      )}
      <div>
        <p className="text-lg font-medium text-white">{displayName}</p>
        <p className="text-sm text-white/50">{user?.email}</p>
      </div>
    </GlassCard>
  );
}
