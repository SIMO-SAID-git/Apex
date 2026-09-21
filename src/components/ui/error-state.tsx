import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message = "Something went wrong while loading this. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="glass rounded-2xl p-10 text-center flex flex-col items-center gap-3 border-status-peak/20"
    >
      <AlertTriangle className="h-8 w-8 text-status-peak" aria-hidden />
      <h3 className="text-base font-semibold text-white">Couldn&apos;t load this</h3>
      <p className="text-sm text-white/60 max-w-sm">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2">
          Try again
        </Button>
      ) : null}
    </div>
  );
}
