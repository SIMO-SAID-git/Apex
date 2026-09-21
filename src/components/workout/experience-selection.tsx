"use client";

import { motion } from "framer-motion";
import type { ExperienceLevel } from "@/types/workout";
import { useWorkoutStore } from "@/stores/workout-store";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { staggerContainer, fadeUp } from "@/lib/animation/variants";

const LEVELS: { value: ExperienceLevel; label: string; description: string }[] = [
  { value: "beginner", label: "Beginner", description: "New to structured training, or returning after a break." },
  { value: "intermediate", label: "Intermediate", description: "Training consistently for 6+ months." },
  { value: "advanced", label: "Advanced", description: "Years of consistent, progressive training." },
];

export function ExperienceSelection() {
  const setExperience = useWorkoutStore((s) => s.setExperience);
  const goToStep = useWorkoutStore((s) => s.goToStep);

  return (
    <div className="space-y-4">
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="grid gap-3">
        {LEVELS.map(({ value, label, description }) => (
          <motion.button
            key={value}
            variants={fadeUp}
            onClick={() => setExperience(value)}
            className="text-left focus-visible:ring-2 focus-visible:ring-accent/60 rounded-2xl"
          >
            <GlassCard className="p-5 interactive">
              <h3 className="font-medium text-white">{label}</h3>
              <p className="mt-1 text-sm text-white/60">{description}</p>
            </GlassCard>
          </motion.button>
        ))}
      </motion.div>
      <Button variant="ghost" size="sm" onClick={() => goToStep("goal")}>
        Back
      </Button>
    </div>
  );
}
