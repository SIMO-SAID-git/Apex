"use client";

import { motion } from "framer-motion";
import type { GeneratedWorkoutPlan } from "@/types/workout";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/workout/progress-ring";
import { CalorieMetric } from "@/components/workout/calorie-metric";
import { MuscleDistribution } from "@/components/workout/muscle-distribution";
import { CalendarSyncButton } from "@/components/workout/calendar-sync-button";
import { useWorkoutStore } from "@/stores/workout-store";
import { staggerContainer, fadeUp } from "@/lib/animation/variants";

const DAY_NAMES = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WorkoutResult({ plan }: { plan: GeneratedWorkoutPlan }) {
  const reset = useWorkoutStore((s) => s.reset);
  const totalSessions = plan.sessions.length;
  const intensityTotal = plan.intensityDistribution.low + plan.intensityDistribution.medium + plan.intensityDistribution.high || 1;

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
      <motion.div variants={fadeUp}>
        <GlassCard strong className="p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-white/50">Your weekly plan</p>
              <h3 className="text-xl font-semibold text-white">
                {totalSessions} session{totalSessions === 1 ? "" : "s"} · {plan.recoveryDaysPerWeek} recovery day
                {plan.recoveryDaysPerWeek === 1 ? "" : "s"}
              </h3>
            </div>
            <CalendarSyncButton plan={plan} />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {plan.sessions.map((session) => (
              <div key={session.day} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-white">
                    {DAY_NAMES[session.day]} · {session.focus}
                  </p>
                  <p className="text-xs text-white/50">{session.durationMinutes} min</p>
                </div>
                <Badge tone="neutral">{session.intensity}</Badge>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      <motion.div variants={fadeUp} className="grid gap-4 sm:grid-cols-2">
        <GlassCard className="p-6 space-y-4">
          <CalorieMetric calories={plan.estimatedWeeklyCalories} />
          <div className="flex items-center justify-around pt-2">
            <ProgressRing
              label="Low"
              value={(plan.intensityDistribution.low / intensityTotal) * 100}
              colorClassName="stroke-status-quiet"
              size={72}
            />
            <ProgressRing
              label="Medium"
              value={(plan.intensityDistribution.medium / intensityTotal) * 100}
              colorClassName="stroke-status-moderate"
              size={72}
            />
            <ProgressRing
              label="High"
              value={(plan.intensityDistribution.high / intensityTotal) * 100}
              colorClassName="stroke-status-peak"
              size={72}
            />
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <p className="text-sm font-medium text-white mb-4">Muscle group distribution</p>
          <MuscleDistribution distribution={plan.muscleDistribution} />
        </GlassCard>
      </motion.div>

      <motion.div variants={fadeUp}>
        <GlassCard className="p-6">
          <p className="text-sm font-medium text-white mb-3">Why this plan</p>
          <ul className="space-y-2">
            {plan.rationale.map((point, i) => (
              <li key={i} className="text-sm text-white/60 flex gap-2">
                <span className="text-accent" aria-hidden>·</span>
                {point}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-white/40">
            Calorie and intensity figures are estimates for planning purposes only and are not medical advice.
          </p>
        </GlassCard>
      </motion.div>

      <Button variant="ghost" size="sm" onClick={reset}>
        Start over
      </Button>
    </motion.div>
  );
}
