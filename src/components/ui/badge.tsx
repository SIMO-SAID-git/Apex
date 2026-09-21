import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type BadgeTone = "neutral" | "success" | "warning" | "danger" | "accent";

const toneStyles: Record<BadgeTone, string> = {
  neutral: "bg-white/10 text-white/80",
  success: "bg-status-quiet/15 text-status-quiet",
  warning: "bg-status-moderate/15 text-status-moderate",
  danger: "bg-status-peak/15 text-status-peak",
  accent: "bg-accent/15 text-accent",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium tracking-wide",
        toneStyles[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
