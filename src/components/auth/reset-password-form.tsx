"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { resetPasswordSchema } from "@/lib/validations/auth-schema";
import { useAuthActions } from "@/hooks/auth/use-auth-actions";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { AuthErrorBanner } from "@/components/auth/auth-error";
import { Button } from "@/components/ui/button";

/**
 * Rendered at /reset-password. By the time a customer lands here, the
 * /auth/callback route has already exchanged the recovery link's code for a
 * short-lived session (or, in mock mode, the flow is simulated end-to-end
 * without a real recovery session) — this form only ever calls
 * updatePassword() against that existing session, it never needs the
 * customer's old password.
 */
export function ResetPasswordForm() {
  const router = useRouter();
  const { updatePassword, isPending, error, clearError } = useAuthActions();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [isDone, setIsDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();

    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      const errors: typeof fieldErrors = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === "password") errors.password = issue.message;
        if (issue.path[0] === "confirmPassword") errors.confirmPassword = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    const success = await updatePassword(parsed.data.password);
    if (success) {
      setIsDone(true);
      setTimeout(() => router.push("/login"), 2000);
    }
  }

  if (isDone) {
    return (
      <div className="text-center space-y-3 py-4">
        <CheckCircle2 className="h-10 w-10 text-status-quiet mx-auto" />
        <p className="text-sm text-white/70">Your password has been updated. Redirecting you to sign in…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <AuthErrorBanner error={error} />

      <div>
        <PasswordInput
          label="New password"
          name="new-password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
        />
        <PasswordStrength password={password} />
      </div>

      <PasswordInput
        label="Confirm new password"
        name="confirm-password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        error={fieldErrors.confirmPassword}
      />

      <Button type="submit" className="w-full" size="lg" isLoading={isPending}>
        Update password
      </Button>
    </form>
  );
}
