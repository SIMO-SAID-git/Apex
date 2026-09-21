"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useWorkoutStore } from "@/stores/workout-store";
import { WorkoutStepper } from "@/components/workout/workout-stepper";
import { GoalSelection } from "@/components/workout/goal-selection";
import { ExperienceSelection } from "@/components/workout/experience-selection";
import { FrequencySelection } from "@/components/workout/frequency-selection";
import { WorkoutResult } from "@/components/workout/workout-result";
import { fadeIn } from "@/lib/animation/variants";

export function WorkoutGenerator() {
  const step = useWorkoutStore((s) => s.step);
  const plan = useWorkoutStore((s) => s.plan);

  return (
    <div className="space-y-8">
      <WorkoutStepper current={step} />

      <AnimatePresence mode="wait">
        <motion.div key={step} initial="hidden" animate="visible" exit="hidden" variants={fadeIn}>
          {step === "goal" ? <GoalSelection /> : null}
          {step === "experience" ? <ExperienceSelection /> : null}
          {step === "frequency" ? <FrequencySelection /> : null}
          {step === "result" && plan ? <WorkoutResult plan={plan} /> : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
