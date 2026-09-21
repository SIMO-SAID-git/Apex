"use client";

import { useMemo } from "react";
import { RotateCcw } from "lucide-react";
import type { ClassCategory, Intensity } from "@/types/class";
import { useSchedulerStore } from "@/stores/scheduler-store";
import { useInstructors } from "@/hooks/queries/use-instructors";
import { FilterChip } from "@/components/scheduler/filter-chip";

const CATEGORY_OPTIONS: { value: ClassCategory; label: string }[] = [
  { value: "strength", label: "Strength" },
  { value: "hiit", label: "HIIT" },
  { value: "cardio", label: "Cardio" },
  { value: "zen", label: "Zen" },
];

const INTENSITY_OPTIONS: { value: Intensity; label: string; dot: string }[] = [
  { value: "low", label: "Low", dot: "bg-status-quiet" },
  { value: "medium", label: "Medium", dot: "bg-status-moderate" },
  { value: "high", label: "High", dot: "bg-status-peak" },
];

export function ClassFilters() {
  const { categories, intensities, instructorIds, toggleCategory, toggleIntensity, toggleInstructor, resetFilters } =
    useSchedulerStore();
  const { data: instructors } = useInstructors();
  const activeCount = useSchedulerStore((s) => s.activeFilterCount());

  const instructorOptions = useMemo(() => instructors ?? [], [instructors]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/60">
          Filters {activeCount > 0 ? <span className="text-accent">({activeCount})</span> : null}
        </h3>
        {activeCount > 0 ? (
          <button
            onClick={resetFilters}
            className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        ) : null}
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {CATEGORY_OPTIONS.map((opt) => (
          <FilterChip
            key={opt.value}
            label={opt.label}
            isActive={categories.includes(opt.value)}
            onClick={() => toggleCategory(opt.value)}
          />
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {INTENSITY_OPTIONS.map((opt) => (
          <FilterChip
            key={opt.value}
            label={opt.label}
            isActive={intensities.includes(opt.value)}
            onClick={() => toggleIntensity(opt.value)}
            dotClassName={opt.dot}
          />
        ))}
      </div>

      {instructorOptions.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {instructorOptions.map((instructor) => (
            <FilterChip
              key={instructor.id}
              label={instructor.name}
              isActive={instructorIds.includes(instructor.id)}
              onClick={() => toggleInstructor(instructor.id)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
