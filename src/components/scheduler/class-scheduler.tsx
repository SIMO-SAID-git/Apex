"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { CalendarX } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useSchedulerStore } from "@/stores/scheduler-store";
import { useBookingStore } from "@/stores/booking-store";
import { useClasses } from "@/hooks/queries/use-classes";
import { useInstructors } from "@/hooks/queries/use-instructors";
import { useAuth } from "@/hooks/auth/use-auth";
import { DayPicker } from "@/components/scheduler/day-picker";
import { ClassFilters } from "@/components/scheduler/class-filters";
import { ClassSlot } from "@/components/scheduler/class-slot";
import { BookingSheet } from "@/components/scheduler/booking-sheet";
import { ClassSlotSkeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import { staggerContainer } from "@/lib/animation/variants";
import { filterClasses } from "@/lib/utils/class-filters";

export function ClassScheduler() {
  const selectedDate = useSchedulerStore((s) => s.selectedDate);
  const setSelectedDate = useSchedulerStore((s) => s.setSelectedDate);
  const categories = useSchedulerStore((s) => s.categories);
  const intensities = useSchedulerStore((s) => s.intensities);
  const instructorIds = useSchedulerStore((s) => s.instructorIds);
  const resetFilters = useSchedulerStore((s) => s.resetFilters);
  const openBookingSheet = useBookingStore((s) => s.openBookingSheet);

  const { data: classes, isLoading, isError, refetch } = useClasses(selectedDate);
  const { data: instructors } = useInstructors();
  const { isAuthenticated } = useAuth();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const pendingClassId = searchParams.get("classId");
  const hasResumedBooking = useRef(false);

  // Full, unfiltered class list — used only to resolve a `?classId=` param
  // that may point at a class on a different day than the default selection
  // (see class-slot.tsx, which is where this param gets attached before an
  // unauthenticated customer is sent to /login).
  const { data: allClasses } = useClasses();

  useEffect(() => {
    if (!pendingClassId || !isAuthenticated || hasResumedBooking.current || !allClasses) return;

    const targetClass = allClasses.find((c) => c.id === pendingClassId);
    if (targetClass) {
      setSelectedDate(targetClass.date);
      openBookingSheet(targetClass);
    }

    hasResumedBooking.current = true;
    const params = new URLSearchParams(searchParams.toString());
    params.delete("classId");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname ?? "/dashboard/schedule");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingClassId, isAuthenticated, allClasses]);

  const instructorById = useMemo(() => {
    const map = new Map(instructors?.map((i) => [i.id, i]));
    return map;
  }, [instructors]);

  const filteredClasses = useMemo(() => {
    if (!classes) return [];
    return filterClasses(classes, { categories, intensities, instructorIds });
  }, [classes, categories, intensities, instructorIds]);

  return (
    <div className="space-y-6">
      <DayPicker />
      <ClassFilters />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ClassSlotSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <ErrorState message="We couldn't load the schedule for this day." onRetry={() => refetch()} />
      ) : filteredClasses.length === 0 ? (
        <EmptyState
          title="No classes match your filters"
          description="Try a different day or clear your filters to see everything available."
          icon={CalendarX}
          actionLabel="Reset filters"
          onAction={resetFilters}
        />
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {filteredClasses.map((fitnessClass) => (
            <ClassSlot
              key={fitnessClass.id}
              fitnessClass={fitnessClass}
              instructor={instructorById.get(fitnessClass.instructorId)}
            />
          ))}
        </motion.div>
      )}

      <BookingSheet />
    </div>
  );
}
