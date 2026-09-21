"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/auth/use-auth";
import { useAuthActions } from "@/hooks/auth/use-auth-actions";
import { resetPasswordSchema } from "@/lib/validations/auth-schema";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { AuthErrorBanner } from "@/components/auth/auth-error";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { LogoutButton } from "@/components/account/logout-button";
import { DeleteAccountDialog } from "@/components/account/delete-account-dialog";

function ChangePasswordForm() {
  const { updatePassword, isPending, error, clearError } = useAuthActions();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    setSuccessMessage(null);

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
      setSuccessMessage("Password updated.");
      setPassword("");
      setConfirmPassword("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AuthErrorBanner error={error} />
      <div>
        <PasswordInput label="New password" name="new-password" autoComplete="new-password" value={password} onChange={setPassword} error={fieldErrors.password} />
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
      {successMessage ? (
        <p role="status" className="text-sm text-status-quiet">
          {successMessage}
        </p>
      ) : null}
      <Button type="submit" isLoading={isPending}>
        Update password
      </Button>
    </form>
  );
}

export function AccountSettings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <h2 className="text-base font-semibold text-white mb-1">Security</h2>
        <p className="text-sm text-white/50 mb-5">Signed in as {user?.email}</p>
        <ChangePasswordForm />
      </GlassCard>

      <GlassCard className="p-6 space-y-4">
        <h2 className="text-base font-semibold text-white">Account</h2>
        <div className="flex flex-wrap gap-3">
          <LogoutButton />
          <DeleteAccountDialog />
        </div>
      </GlassCard>
    </div>
  );
}
