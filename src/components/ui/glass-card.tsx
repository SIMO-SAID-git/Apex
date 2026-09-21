import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function GlassCard({
  className,
  strong,
  ...props
}: HTMLAttributes<HTMLDivElement> & { strong?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl",
        strong ? "glass-strong" : "glass",
        className
      )}
      {...props}
    />
  );
}
