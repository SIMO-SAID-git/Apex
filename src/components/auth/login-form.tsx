"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { loginSchema } from "@/lib/validations/auth-schema";
import { useAuthActions } from "@/hooks/auth/use-auth-actions";
import { Input, Label, FieldError } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";
import { AuthErrorBanner } from "@/components/auth/auth-error";
import { OAuthButton } from "@/components/auth/oauth-button";
import { Button } from "@/components/ui/button";
import { appendClassIdParam, sanitizeRedirectTarget } from "@/lib/auth/auth-redirects";

export function LoginForm() {
  const searchParams = useSearchParams();
  const { signIn, signInWithOAuth, isGoogleConfigured, isPending, error, clearError } = useAuthActions();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const emailId = useId();

  const rawRedirect = searchParams.get("redirect");
  const classId = searchParams.get("classId");
  const redirectTarget = appendClassIdParam(sanitizeRedirectTarget(rawRedirect), classId);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const errors: typeof fieldErrors = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0] === "email") errors.email = issue.message;
        if (issue.path[0] === "password") errors.password = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    await signIn(parsed.data, redirectTarget);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <AuthErrorBanner error={error} />

      {error?.code === "EMAIL_NOT_VERIFIED" ? (
        <p className="text-xs text-white/50 -mt-2">
          <Link href={`/verify-email?email=${encodeURIComponent(email)}`} className="text-accent hover:underline">
            Go to email verification
          </Link>
        </p>
      ) : null}

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
          hasError={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? `${emailId}-error` : undefined}
        />
        <FieldError id={`${emailId}-error`} message={fieldErrors.email} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <Label className="mb-0">Password</Label>
          <Link href="/forgot-password" className="text-xs text-white/50 hover:text-white transition-colors">
            Forgot password?
          </Link>
        </div>
        <PasswordInput
          label=""
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
        />
      </div>

      <Button type="submit" className="w-full" size="lg" isLoading={isPending}>
        Sign in
      </Button>

      <div className="relative py-2 text-center">
        <span className="relative bg-transparent px-3 text-xs text-white/40 z-10">or</span>
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/10" aria-hidden />
      </div>

      <OAuthButton onClick={() => signInWithOAuth("google")} isConfigured={isGoogleConfigured} />

      <p className="text-center text-sm text-white/60">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="text-accent hover:underline">
          Create account
        </Link>
      </p>
    </form>
  );
}
