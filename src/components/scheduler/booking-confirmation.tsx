import { CheckCircle2 } from "lucide-react";
import type { FitnessClass } from "@/types/class";
import { formatFriendlyDate, formatTimeRange } from "@/lib/utils/dates";

export function BookingConfirmation({
  fitnessClass,
  isWaitlisted,
}: {
  fitnessClass: FitnessClass;
  isWaitlisted: boolean;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-3 py-4">
      <CheckCircle2 className="h-10 w-10 text-status-quiet" aria-hidden />
      <h3 className="text-lg font-semibold text-white">
        {isWaitlisted ? "You're on the waitlist" : "You're booked"}
      </h3>
      <p className="text-sm text-white/60 max-w-xs">
        {isWaitlisted
          ? `We'll notify you if a spot opens up in ${fitnessClass.title}.`
          : `See you at ${fitnessClass.title} on ${formatFriendlyDate(fitnessClass.date)}.`}
      </p>
      <p className="text-xs text-white/40">{formatTimeRange(fitnessClass.startTime, fitnessClass.endTime)}</p>
    </div>
  );
}
