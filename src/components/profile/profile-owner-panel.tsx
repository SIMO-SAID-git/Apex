"use client";

import { useMemo, useState } from "react";
import { Eye, Pencil } from "lucide-react";
import { useProfile } from "@/hooks/auth/use-profile";
import { useMyTaughtClasses } from "@/hooks/queries/use-my-taught-classes";
import { ProfileForm } from "@/components/account/profile-form";
import { TrainerDetailsForm } from "@/components/account/trainer-details-form";
import { MemberProfile } from "@/components/profile/member-profile";
import { TrainerProfile } from "@/components/profile/trainer-profile";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { mapToPublicProfile } from "@/lib/utils/public-profile";
import { cn } from "@/lib/utils/cn";
import type { PublicClassSummary } from "@/types/class";

type ViewMode = "edit" | "preview";

/**
 * Task #2: in-page editing (no redirect to a separate settings page for
 * basic info) plus a "how this appears to others" preview toggle. Only ever
 * rendered when the visitor IS the profile owner (see the isOwner check in
 * app/profile/[username]/page.tsx) — the edit form itself is additionally
 * protected because ProfileForm/TrainerDetailsForm submit through
 * /api/profile, which re-derives identity from the session server-side.
 */
export function ProfileOwnerPanel() {
  const { data: profile, isLoading } = useProfile();
  const { data: taughtClasses } = useMyTaughtClasses();
  const [mode, setMode] = useState<ViewMode>("edit");

  const upcomingClasses: PublicClassSummary[] = useMemo(() => {
    if (!taughtClasses) return [];
    const todayIso = new Date().toISOString().slice(0, 10);
    return taughtClasses
      .filter((c) => c.isPublished && c.date >= todayIso)
      .sort((a, b) => (a.date === b.date ? a.startTime.localeCompare(b.startTime) : a.date.localeCompare(b.date)))
      .slice(0, 6)
      .map((c) => ({ id: c.id, title: c.title, date: c.date, startTime: c.startTime, endTime: c.endTime, category: c.category, intensity: c.intensity }));
  }, [taughtClasses]);

  if (isLoading || !profile) {
    return <Skeleton className="h-64 w-full rounded-2xl" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center sm:justify-end gap-1 rounded-full glass p-1 w-fit mx-auto sm:mx-0">
        {(["edit", "preview"] as const).map((option) => (
          <button
            key={option}
            onClick={() => setMode(option)}
            aria-pressed={mode === option}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm transition-colors",
              mode === option ? "bg-white text-surface-950 font-medium" : "text-white/60 hover:text-white"
            )}
          >
            {option === "edit" ? <Pencil className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {option === "edit" ? "Edit profile" : "How others see this"}
          </button>
        ))}
      </div>

      {mode === "preview" ? (
        profile.role === "trainer" ? (
          <TrainerProfile profile={mapToPublicProfile(profile, upcomingClasses) as Extract<ReturnType<typeof mapToPublicProfile>, { role: "trainer" }>} />
        ) : (
          <MemberProfile profile={mapToPublicProfile(profile) as Extract<ReturnType<typeof mapToPublicProfile>, { role: "member" }>} />
        )
      ) : (
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h2 className="text-base font-semibold text-white mb-5">Basic info</h2>
            <ProfileForm />
          </GlassCard>
          {profile.role === "trainer" ? <TrainerDetailsForm profile={profile} /> : null}
        </div>
      )}
    </div>
  );
}
