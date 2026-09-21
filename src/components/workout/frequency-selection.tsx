"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { DaysPerWeek } from "@/types/workout";
import { useWorkoutStore } from "@/stores/workout-store";
import { Button } from "@/components/ui/button";
import { generateWorkoutPlan } from "@/lib/services/workout-service";
import { staggerContainer, fadeUp } from "@/lib/animation/variants";
import { cn } from "@/lib/utils/cn";

const OPTIONS: DaysPerWeek[] = [2, 3, 4, 5, 6];

export function FrequencySelection() {
  const { goal, experience, setDaysPerWeek, setPlan, goToStep } = useWorkoutStore();
  const [selected, setSelected] = useState<DaysPerWeek | null>(null);

  function handleGenerate() {
    if (!goal || !experience || !selected) return;
    setDaysPerWeek(selected);
    const plan = generateWorkoutPlan({ goal, experience, daysPerWeek: selected });
    setPlan(plan);
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="grid grid-cols-5 gap-2"
        role="radiogroup"
        aria-label="Training days per week"
      >
        {OPTIONS.map((days) => (
          <motion.button
            key={days}
            variants={fadeUp}
            role="radio"
            aria-checked={selected === days}
            onClick={() => setSelected(days)}
            className={cn(
              "aspect-square rounded-2xl flex flex-col items-center justify-center transition-colors",
              "focus-visible:ring-2 focus-visible:ring-accent/60",
              selected === days ? "bg-accent text-surface-950" : "glass text-white/70 hover:text-white hover:bg-white/10"
            )}
          >
            <span className="text-xl font-semibold">{days}</span>
            <span className="text-[10px] uppercase tracking-wide opacity-80">days</span>
          </motion.button>
        ))}
      </motion.div>

      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => goToStep("experience")}>
          Back
        </Button>
        <Button className="flex-1" disabled={!selected} onClick={handleGenerate}>
          Generate my plan
        </Button>
      </div>
    </div>
  );
}
