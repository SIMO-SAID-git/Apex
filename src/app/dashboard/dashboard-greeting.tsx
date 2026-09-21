"use client";

import { useAuth } from "@/hooks/auth/use-auth";

export function DashboardGreeting() {
  const { profile, user, isLoading } = useAuth();
  const firstName = profile?.firstName || user?.email?.split("@")[0];

  return (
    <p className="mt-2 text-white/60">
      {isLoading ? "Welcome back." : firstName ? `Welcome back, ${firstName}.` : "Welcome back."} Here&apos;s
      what&apos;s happening at the club.
    </p>
  );
}
