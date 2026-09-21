import { AlertTriangle } from "lucide-react";
import type { AuthError } from "@/lib/auth/auth-errors";

export function AuthErrorBanner({ error }: { error: AuthError | null }) {
  if (!error) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 rounded-xl bg-status-peak/10 border border-status-peak/20 px-4 py-3 text-sm text-status-peak"
    >
      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
      <span>{error.message}</span>
    </div>
  );
}
