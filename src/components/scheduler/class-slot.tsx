"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Users } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import type { FitnessClass } from "@/types/class";
import type { Instructor } from "@/types/instructor";
import { formatTimeRange } from "@/lib/utils/dates";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ClassStatusBadge } from "@/components/scheduler/class-status-badge";
import { InstructorTooltip } from "@/components/scheduler/instructor-tooltip";
import { AttendeeRosterModal } from "@/components/scheduler/attendee-roster-modal";
import { UpgradeRequiredModal } from "@/components/membership/upgrade-required-modal";
import { useBookingStore } from "@/stores/booking-store";
import { useAuth } from "@/hooks/auth/use-auth";
import { isTrainer, canBookAsAttendee, canViewAttendeeRoster } from "@/lib/auth/permissions";
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
  const { isAuthenticated, isLoading, profile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showUpgradeModal, setShowUpgradeModal] = useState<"booking" | "roster" | null>(null);
  const [showRoster, setShowRoster] = useState(false);

  const isBookable = fitnessClass.status !== "full";
  const trainerViewer = isTrainer(profile);

  function handleBookClick() {
    if (!isAuthenticated) {
      // Preserve exactly which class the customer wanted through the auth
      // gate via a plain URL query param — no server round-trip, nothing
      // sensitive. class-scheduler.tsx reads `classId` back off the URL
      // once they land back here after signing in and reopens this sheet.
      router.push(buildLoginRedirectUrl(pathname ?? "/dashboard/schedule", { classId: fitnessClass.id }));
      return;
    }
    if (!canBookAsAttendee(profile)) {
      setShowUpgradeModal("booking");
      return;
    }
    openBookingSheet(fitnessClass);
  }

  function handleRosterClick() {
    if (!isAuthenticated) return;
    if (!canViewAttendeeRoster(profile)) {
      setShowUpgradeModal("roster");
      return;
    }
    setShowRoster(true);
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

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <button
                onClick={handleRosterClick}
                className="flex items-center gap-1 text-xs text-white/40 hover:text-white/70 transition-colors"
                aria-label="View attendees"
                title="View attendees"
              >
                <Users className="h-3.5 w-3.5" />
                {fitnessClass.bookedCount}
              </button>
            ) : null}

            {trainerViewer ? (
              <span className="text-xs text-white/40 italic">Trainers don&apos;t book classes</span>
            ) : (
              <Button
                size="sm"
                variant={isBookable ? "primary" : "outline"}
                disabled={!isBookable || isLoading}
                onClick={handleBookClick}
              >
                {fitnessClass.status === "waitlist" ? "Join waitlist" : isBookable ? "Book" : "Full"}
              </Button>
            )}
          </div>
        </div>
      </GlassCard>

      <AttendeeRosterModal
        isOpen={showRoster}
        onClose={() => setShowRoster(false)}
        classId={fitnessClass.id}
        classTitle={fitnessClass.title}
      />

      <UpgradeRequiredModal
        isOpen={showUpgradeModal !== null}
        onClose={() => setShowUpgradeModal(null)}
        title={showUpgradeModal === "roster" ? "See who's coming" : "Book this class"}
        description={
          showUpgradeModal === "roster"
            ? "Viewing the attendee list is included with a paid membership. Upgrade to see who else is training."
            : "Booking classes is included with a paid membership. Upgrade to Foundation, Performance, or Elite to book this class."
        }
      />
    </motion.div>
  );
}
