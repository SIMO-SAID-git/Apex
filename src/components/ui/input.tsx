import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, hasError, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl bg-white/[0.04] border px-4 py-3 text-sm text-white placeholder:text-white/30",
        "transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50",
        hasError ? "border-status-peak/60" : "border-white/10 focus:border-white/20",
        className
      )}
      aria-invalid={hasError || undefined}
      {...props}
    />
  );
});
Input.displayName = "Input";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("block text-sm font-medium text-white/80 mb-1.5", className)} {...props} />;
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-status-peak">
      {message}
    </p>
  );
}
