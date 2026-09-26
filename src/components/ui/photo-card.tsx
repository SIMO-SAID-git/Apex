import Image from "next/image";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PhotoCardProps {
  imageUrl: string;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  className?: string;
  imageAlt?: string;
  /** "end" (default) matches the home page pillars; "center" is used for the facilities grid. */
  align?: "end" | "center";
  children?: React.ReactNode;
}

/**
 * A background-photo card with a dark gradient overlay strong enough to
 * keep white text readable over any image (task #1 / #7: "proper overlay
 * styling for readable white text"). Shared by the home page pillars and
 * the facilities grid so both get the same treatment.
 */
export function PhotoCard({ imageUrl, title, description, icon: Icon, className, imageAlt = "", align = "end", children }: PhotoCardProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-white/10 group", className)}>
      <Image
        src={imageUrl}
        alt={imageAlt}
        fill
        sizes="(max-width: 768px) 100vw, 33vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/60 to-surface-950/10" aria-hidden />
      <div
        className={cn(
          "relative z-10 flex h-full flex-col p-6",
          align === "center" ? "items-center justify-center text-center" : "justify-end"
        )}
      >
        {Icon ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-accent mb-4">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
        {title ? (
          <h3 className="font-display text-lg font-medium text-white [text-shadow:0_1px_8px_rgba(0,0,0,0.5)]">{title}</h3>
        ) : null}
        {description ? <p className="mt-2 text-sm text-white/80 [text-shadow:0_1px_6px_rgba(0,0,0,0.5)]">{description}</p> : null}
        {children}
      </div>
    </div>
  );
}
