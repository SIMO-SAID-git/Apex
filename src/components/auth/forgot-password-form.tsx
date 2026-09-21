"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { forgotPasswordSchema } from "@/lib/validations/auth-schema";
import { useAuthActions } from "@/hooks/auth/use-auth-actions";
import { Input, Label, FieldError } from "@/components/ui/input";
import { AuthErrorBanner } from "@/components/auth/auth-error";
import { Button } from "@/components/ui/button";

export function ForgotPasswordForm() {
  const { resetPassword, isPending, error, clearError } = useAuthActions();
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const emailId = useId();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();

    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message);
      return;
    }
    setFieldError(undefined);

    await resetPassword(parsed.data.email);
    // Always show the generic success state, whether or not the address is
    // registered — this is what prevents account enumeration via this form.
    setIsSubmitted(true);
  }

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4 py-4">
        <CheckCircle2 className="h-10 w-10 text-status-quiet mx-auto" />
        <p className="text-sm text-white/70">
          If an account exists for <span className="text-white">{email}</span>, you&apos;ll receive a password
          reset link shortly.
        </p>
        <Link href="/login" className="inline-block text-sm text-accent hover:underline">
          Return to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <AuthErrorBanner error={error} />

      <div>
        <Label htmlFor={emailId}>Email</Label>
        <Input
          id={emailId}
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          hasError={Boolean(fieldError)}
          aria-describedby={fieldError ? `${emailId}-error` : undefined}
        />
        <FieldError id={`${emailId}-error`} message={fieldError} />
      </div>

      <Button type="submit" className="w-full" size="lg" isLoading={isPending}>
        Send reset link
      </Button>

      <p className="text-center text-sm text-white/60">
        <Link href="/login" className="text-accent hover:underline">
          Return to login
        </Link>
      </p>
    </form>
  );
}
