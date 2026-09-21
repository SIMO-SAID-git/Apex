"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import type { FitnessClass } from "@/types/class";
import type { Instructor } from "@/types/instructor";
import { formatTimeRange } from "@/lib/utils/dates";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClassStatusBadge } from "@/components/scheduler/class-status-badge";
import { InstructorTooltip } from "@/components/scheduler/instructor-tooltip";
import { useBookingStore } from "@/stores/booking-store";
import { useAuth } from "@/hooks/auth/use-auth";
import { buildLoginRedirectUrl } from "@/lib/auth/auth-redirects";
import { fadeUp } from "@/lib/animation/variants";

const CATEGORY_LABEL: Record<FitnessClass["category"], string> = {
  strength: "Strength",
  hiit: "HIIT",
  cardio: "Cardio",
  zen: "Zen",
};

const INTENSITY_DOT: Record<FitnessClass["intensity"], string> = {
  low: "bg-status-quiet",
  medium: "bg-status-moderate",
  high: "bg-status-peak",
};

export function ClassSlot({ fitnessClass, instructor }: { fitnessClass: FitnessClass; instructor?: Instructor }) {
  const openBookingSheet = useBookingStore((s) => s.openBookingSheet);
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isBookable = fitnessClass.status !== "full";

  function handleBookClick() {
    if (!isAuthenticated) {
      // Preserve exactly which class the customer wanted through the auth
      // gate via a plain URL query param — no server round-trip, nothing
      // sensitive. class-scheduler.tsx reads `classId` back off the URL
      // once they land back here after signing in and reopens this sheet.
      router.push(buildLoginRedirectUrl(pathname ?? "/dashboard/schedule", { classId: fitnessClass.id }));
      return;
    }
    openBookingSheet(fitnessClass);
  }

  return (
    <motion.div variants={fadeUp}>
      <GlassCard className="p-4 flex flex-col gap-3 h-full">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <Clock className="h-3.5 w-3.5" />
            {formatTimeRange(fitnessClass.startTime, fitnessClass.endTime)}
          </div>
          <ClassStatusBadge
            status={fitnessClass.status}
            capacity={fitnessClass.capacity}
            bookedCount={fitnessClass.bookedCount}
          />
        </div>

        <div>
          <h3 className="text-base font-semibold text-white">{fitnessClass.title}</h3>
          <p className="mt-1 text-sm text-white/60 line-clamp-2">{fitnessClass.description}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Badge tone="neutral">{CATEGORY_LABEL[fitnessClass.category]}</Badge>
          <Badge tone="neutral" className="gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${INTENSITY_DOT[fitnessClass.intensity]}`} aria-hidden />
            {fitnessClass.intensity[0]?.toUpperCase()}
            {fitnessClass.intensity.slice(1)}
          </Badge>
          <Badge tone="neutral">{fitnessClass.durationMinutes} min</Badge>
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          {instructor ? (
            <InstructorTooltip instructor={instructor} />
          ) : (
            <span className="text-xs text-white/40">Instructor TBD</span>
          )}
          <Button
            size="sm"
            variant={isBookable ? "primary" : "outline"}
            disabled={!isBookable || isLoading}
            onClick={handleBookClick}
          >
            {fitnessClass.status === "waitlist" ? "Join waitlist" : isBookable ? "Book" : "Full"}
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  );
}
