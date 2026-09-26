"use client";

import { useId, useState } from "react";
import { CalendarPlus, CheckCircle2, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/auth/use-auth";
import { isElite } from "@/lib/auth/permissions";
import { useBookSession } from "@/hooks/mutations/use-book-session";
import { GlassCard } from "@/components/ui/glass-card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

/**
 * Task #4: "When an active Elite member views a trainer's profile, display
 * an exclusive 'Book 1-on-1 Training Session' CTA module." Renders nothing
 * for trainers viewing their own profile, and a soft upsell (rather than
 * hiding entirely) for non-Elite members, so the perk is visible and worth
 * upgrading for.
 */
export function EliteSessionCta({ trainerUsername, trainerName }: { trainerUsername: string; trainerName: string }) {
  const { isAuthenticated, profile } = useAuth();
  const bookSession = useBookSession();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const dateId = useId();
  const timeId = useId();

  if (profile?.role === "trainer") return null;

  if (!isAuthenticated || !isElite(profile)) {
    return (
      <GlassCard strong className="p-6 flex items-center gap-4 flex-wrap justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="font-medium text-white">1:1 sessions with {trainerName}</p>
            <p className="text-sm text-white/50">Available exclusively to Elite members.</p>
          </div>
        </div>
        <Link href="/membership" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Upgrade to Elite
        </Link>
      </GlassCard>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!date || !time) {
      setError("Choose a date and time.");
      return;
    }
    const scheduledAt = new Date(`${date}T${time}:00`);
    if (Number.isNaN(scheduledAt.getTime()) || scheduledAt.getTime() <= Date.now()) {
      setError("Choose a time in the future.");
      return;
    }

    bookSession.mutate(
      { trainerUsername, scheduledAt: scheduledAt.toISOString() },
      { onError: () => setError("Unable to book this session right now.") }
    );
  }

  return (
    <GlassCard strong className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Sparkles className="h-5 w-5" />
        </div>
        <div>
          <p className="font-medium text-white">Book a 1-on-1 session with {trainerName}</p>
          <p className="text-sm text-white/50">Included with your Elite membership.</p>
        </div>
      </div>

      {bookSession.isSuccess ? (
        <p className="flex items-center gap-2 text-sm text-status-quiet">
          <CheckCircle2 className="h-4 w-4" />
          Session requested — {trainerName} will confirm shortly.
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
          <div>
            <Label htmlFor={dateId}>Date</Label>
            <Input id={dateId} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor={timeId}>Time</Label>
            <Input id={timeId} type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </div>
          <Button type="submit" isLoading={bookSession.isPending}>
            <CalendarPlus className="h-4 w-4" />
            Request session
          </Button>
          {error ? <p className="w-full text-sm text-status-peak">{error}</p> : null}
        </form>
      )}
    </GlassCard>
  );
}
