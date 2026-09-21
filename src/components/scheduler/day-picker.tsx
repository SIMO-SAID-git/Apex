"use client";

import { getCurrentWeek } from "@/lib/utils/dates";
import { useSchedulerStore } from "@/stores/scheduler-store";
import { cn } from "@/lib/utils/cn";

export function DayPicker() {
  const week = getCurrentWeek();
  const selectedDate = useSchedulerStore((s) => s.selectedDate);
  const setSelectedDate = useSchedulerStore((s) => s.setSelectedDate);

  return (
    <div
      role="tablist"
      aria-label="Select a day"
      className="flex gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0"
    >
      {week.map((day) => {
        const isSelected = day.date === selectedDate;
        return (
          <button
            key={day.date}
            role="tab"
            aria-selected={isSelected}
            onClick={() => setSelectedDate(day.date)}
            className={cn(
              "flex min-w-[64px] flex-col items-center gap-1 rounded-2xl px-4 py-3 shrink-0 transition-colors",
              "focus-visible:ring-2 focus-visible:ring-accent/60",
              isSelected ? "bg-accent text-surface-950" : "glass text-white/70 hover:text-white hover:bg-white/10"
            )}
          >
            <span className="text-xs uppercase tracking-wide opacity-80">{day.label}</span>
            <span className="text-lg font-semibold">{day.dayNumber}</span>
            {day.isToday ? (
              <span
                className={cn(
                  "h-1 w-1 rounded-full",
                  isSelected ? "bg-surface-950" : "bg-accent"
                )}
                aria-hidden
              />
            ) : (
              <span className="h-1 w-1" aria-hidden />
            )}
          </button>
        );
      })}
    </div>
  );
}
