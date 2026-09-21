import { Flame } from "lucide-react";
import { formatCalories } from "@/lib/utils/formatters";

export function CalorieMetric({ calories }: { calories: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-status-peak/15 text-status-peak">
        <Flame className="h-5 w-5" />
      </div>
      <div>
        <p className="text-lg font-semibold text-white">{formatCalories(calories)}</p>
        <p className="text-xs text-white/50">Estimated weekly burn — not medical advice</p>
      </div>
    </div>
  );
}
