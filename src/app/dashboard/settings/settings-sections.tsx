"use client";

import { useProfile } from "@/hooks/auth/use-profile";
import { ProfileForm } from "@/components/account/profile-form";
import { TrainerDetailsForm } from "@/components/account/trainer-details-form";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";

export function SettingsSections() {
  const { data: profile, isLoading } = useProfile();

  return (
    <>
      <GlassCard className="p-6">
        <h2 className="text-base font-semibold text-white mb-5">Profile</h2>
        <ProfileForm />
      </GlassCard>

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-2xl" />
      ) : profile?.role === "trainer" ? (
        <TrainerDetailsForm profile={profile} />
      ) : null}
    </>
  );
}
