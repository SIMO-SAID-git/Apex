import { cn } from "@/lib/utils/cn";
import type { WorkoutWizardStep } from "@/stores/workout-store";

const STEPS: { key: WorkoutWizardStep; label: string }[] = [
  { key: "goal", label: "Goal" },
  { key: "experience", label: "Experience" },
  { key: "frequency", label: "Frequency" },
  { key: "result", label: "Plan" },
];

export function WorkoutStepper({ current }: { current: WorkoutWizardStep }) {
  const currentIndex = STEPS.findIndex((s) => s.key === current);

  return (
    <ol className="flex items-center gap-2" aria-label="Workout plan progress">
      {STEPS.map((step, index) => {
        const isComplete = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <li key={step.key} className="flex items-center gap-2 flex-1">
            <div
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-medium border",
                isCurrent
                  ? "bg-accent text-surface-950 border-accent"
                  : isComplete
                  ? "bg-white/15 text-white border-white/20"
                  : "text-white/40 border-white/15"
              )}
              aria-current={isCurrent ? "step" : undefined}
            >
              {index + 1}
            </div>
            <span className={cn("text-xs hidden sm:inline", isCurrent ? "text-white" : "text-white/40")}>
              {step.label}
            </span>
            {index < STEPS.length - 1 ? (
              <div className={cn("h-px flex-1", isComplete ? "bg-white/30" : "bg-white/10")} aria-hidden />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
