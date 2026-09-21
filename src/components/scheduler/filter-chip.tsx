"use client";

import { cn } from "@/lib/utils/cn";

interface FilterChipProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  dotClassName?: string;
}

export function FilterChip({ label, isActive, onClick, dotClassName }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm transition-colors shrink-0",
        "focus-visible:ring-2 focus-visible:ring-accent/60",
        isActive ? "bg-white text-surface-950 font-medium" : "glass text-white/70 hover:text-white hover:bg-white/10"
      )}
    >
      {dotClassName ? <span className={cn("h-2 w-2 rounded-full", dotClassName)} aria-hidden /> : null}
      {label}
    </button>
  );
}
