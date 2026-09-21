"use client";

import { motion } from "framer-motion";
import type { MuscleDistribution as MuscleDistributionType } from "@/types/workout";

const GROUP_LABEL: Record<string, string> = {
  chest: "Chest",
  back: "Back",
  legs: "Legs",
  shoulders: "Shoulders",
  arms: "Arms",
  core: "Core",
};

/** Horizontal bar breakdown of training volume by muscle group. Simple SVG, no chart library. */
export function MuscleDistribution({ distribution }: { distribution: MuscleDistributionType[] }) {
  const sorted = [...distribution].sort((a, b) => b.percentage - a.percentage);
  const max = Math.max(...sorted.map((d) => d.percentage), 1);

  return (
    <div className="space-y-3" role="img" aria-label="Muscle group distribution for this plan">
      {sorted.map((item, index) => (
        <div key={item.group} className="flex items-center gap-3">
          <span className="w-20 shrink-0 text-xs text-white/60">{GROUP_LABEL[item.group] ?? item.group}</span>
          <svg viewBox="0 0 100 8" className="flex-1 h-2" preserveAspectRatio="none" aria-hidden>
            <rect x={0} y={0} width={100} height={8} rx={4} className="fill-white/10" />
            <motion.rect
              x={0}
              y={0}
              height={8}
              rx={4}
              className="fill-accent"
              initial={{ width: 0 }}
              animate={{ width: (item.percentage / max) * 100 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.05 }}
            />
          </svg>
          <span className="w-10 shrink-0 text-right text-xs text-white/70">{item.percentage}%</span>
        </div>
      ))}
    </div>
  );
}
