"use client";

import { motion } from "framer-motion";
import { Dumbbell, Flame, HeartPulse, Leaf, Sparkles } from "lucide-react";
import type { WorkoutGoal } from "@/types/workout";
import { useWorkoutStore } from "@/stores/workout-store";
import { GlassCard } from "@/components/ui/glass-card";
import { staggerContainer, fadeUp } from "@/lib/animation/variants";

const GOALS: { value: WorkoutGoal; label: string; description: string; icon: typeof Dumbbell }[] = [
  { value: "build-strength", label: "Build Strength", description: "Progressive barbell and compound lifts.", icon: Dumbbell },
  { value: "lose-fat", label: "Lose Fat", description: "High energy-expenditure conditioning.", icon: Flame },
  { value: "improve-conditioning", label: "Improve Conditioning", description: "Aerobic and anaerobic capacity.", icon: HeartPulse },
  { value: "mobility-recovery", label: "Mobility & Recovery", description: "Joint health and recovery focus.", icon: Leaf },
  { value: "general-fitness", label: "General Fitness", description: "A balanced mix of everything.", icon: Sparkles },
];

export function GoalSelection() {
  const setGoal = useWorkoutStore((s) => s.setGoal);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="grid gap-3 sm:grid-cols-2"
      role="radiogroup"
      aria-label="Select your training goal"
    >
      {GOALS.map(({ value, label, description, icon: Icon }) => (
        <motion.button
          key={value}
          variants={fadeUp}
          role="radio"
          aria-checked={false}
          onClick={() => setGoal(value)}
          className="text-left focus-visible:ring-2 focus-visible:ring-accent/60 rounded-2xl"
        >
          <GlassCard className="p-5 h-full interactive flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-medium text-white">{label}</h3>
              <p className="mt-1 text-sm text-white/60">{description}</p>
            </div>
          </GlassCard>
        </motion.button>
      ))}
    </motion.div>
  );
}
