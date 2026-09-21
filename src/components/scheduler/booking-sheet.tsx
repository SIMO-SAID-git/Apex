"use client";

import { useState } from "react";
import { CalendarDays, Users } from "lucide-react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { Button } from "@/components/ui/button";
import { useBookingStore } from "@/stores/booking-store";
import { useCreateBooking } from "@/hooks/mutations/use-create-booking";
import { useInstructors } from "@/hooks/queries/use-instructors";
import { InstructorTooltip } from "@/components/scheduler/instructor-tooltip";
import { BookingConfirmation } from "@/components/scheduler/booking-confirmation";
import { formatFriendlyDate, formatTimeRange } from "@/lib/utils/dates";
import { ApiError } from "@/lib/api/client";

export function BookingSheet() {
  const { selectedClass, sheetState, closeBookingSheet, setSheetState, setError, errorMessage } = useBookingStore();
  const { mutate, reset } = useCreateBooking();
  const { data: instructors } = useInstructors();
  const [lastWasWaitlisted, setLastWasWaitlisted] = useState(false);

  const instructor = instructors?.find((i) => i.id === selectedClass?.instructorId);
  const isOpen = sheetState !== "closed" && selectedClass !== null;

  function handleClose() {
    reset();
    closeBookingSheet();
  }

  function handleConfirm() {
    if (!selectedClass) return;
    setSheetState("pending");

    mutate(
      { classId: selectedClass.id },
      {
        onSuccess: (result) => {
          setLastWasWaitlisted(result.booking.status === "waitlisted");
          setSheetState("success");
        },
        onError: (error) => {
          const message = error instanceof ApiError ? error.message : "Something went wrong booking this class.";
          setError(message);
        },
      }
    );
  }

  if (!selectedClass) return null;

  const spotsLeft = Math.max(0, selectedClass.capacity - selectedClass.bookedCount);

  return (
    <BottomSheet isOpen={isOpen} onClose={handleClose} title={sheetState === "success" ? "Confirmed" : "Confirm booking"}>
      {sheetState === "success" ? (
        <>
          <BookingConfirmation fitnessClass={selectedClass} isWaitlisted={lastWasWaitlisted} />
          <Button className="w-full" onClick={handleClose}>
            Done
          </Button>
        </>
      ) : (
        <div className="space-y-5">
          <div>
            <h3 className="text-base font-semibold text-white">{selectedClass.title}</h3>
            <p className="mt-1 text-sm text-white/60">{selectedClass.description}</p>
          </div>

          <div className="flex items-center justify-between text-sm text-white/70">
            <span className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-white/40" />
              {formatFriendlyDate(selectedClass.date)}, {formatTimeRange(selectedClass.startTime, selectedClass.endTime)}
            </span>
          </div>

          <div className="flex items-center justify-between text-sm text-white/70">
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-white/40" />
              {spotsLeft > 0 ? `${spotsLeft} of ${selectedClass.capacity} spots left` : "Class full · waitlist available"}
            </span>
          </div>

          {instructor ? (
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
              <InstructorTooltip instructor={instructor} />
              <div>
                <p className="text-sm font-medium text-white">{instructor.name}</p>
                <p className="text-xs text-white/50">{instructor.certifications[0]}</p>
              </div>
            </div>
          ) : null}

          {sheetState === "error" && errorMessage ? (
            <p role="alert" className="text-sm text-status-peak">
              {errorMessage}
            </p>
          ) : null}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleClose} disabled={sheetState === "pending"}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleConfirm} isLoading={sheetState === "pending"}>
              {spotsLeft > 0 ? "Confirm booking" : "Join waitlist"}
            </Button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
}
