"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerSchema } from "@/lib/validations/auth-schema";
import { useAuthActions } from "@/hooks/auth/use-auth-actions";
import { Input, Label, FieldError } from "@/components/ui/input";
import { PasswordInput } from "@/components/auth/password-input";
import { PasswordStrength } from "@/components/auth/password-strength";
import { AuthErrorBanner } from "@/components/auth/auth-error";
import { Button } from "@/components/ui/button";

type FieldErrors = Partial<Record<"firstName" | "lastName" | "email" | "password" | "confirmPassword" | "acceptedTerms", string>>;

export function RegisterForm() {
  const router = useRouter();
  const { signUp, isPending, error, clearError } = useAuthActions();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const firstNameId = useId();
  const lastNameId = useId();
  const emailId = useId();
  const termsId = useId();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();

    const parsed = registerSchema.safeParse({
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      acceptedTerms,
    });

    if (!parsed.success) {
      const errors: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof FieldErrors;
        if (key) errors[key] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    const result = await signUp({ firstName, lastName, email, password });
    if (result) {
      router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <AuthErrorBanner error={error} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={firstNameId}>First name</Label>
          <Input
            id={firstNameId}
            name="given-name"
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            hasError={Boolean(fieldErrors.firstName)}
            aria-describedby={fieldErrors.firstName ? `${firstNameId}-error` : undefined}
          />
          <FieldError id={`${firstNameId}-error`} message={fieldErrors.firstName} />
        </div>
        <div>
          <Label htmlFor={lastNameId}>Last name</Label>
          <Input
            id={lastNameId}
            name="family-name"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            hasError={Boolean(fieldErrors.lastName)}
            aria-describedby={fieldErrors.lastName ? `${lastNameId}-error` : undefined}
          />
          <FieldError id={`${lastNameId}-error`} message={fieldErrors.lastName} />
        </div>
      </div>

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
        <PasswordInput
          label="Password"
          name="new-password"
          autoComplete="new-password"
          value={password}
          onChange={setPassword}
          error={fieldErrors.password}
        />
        <PasswordStrength password={password} />
      </div>

      <PasswordInput
        label="Confirm password"
        name="confirm-password"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={setConfirmPassword}
        error={fieldErrors.confirmPassword}
      />

      <div>
        <div className="flex items-start gap-2.5">
          <input
            id={termsId}
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5 text-accent focus:ring-2 focus:ring-accent/50"
            aria-describedby={fieldErrors.acceptedTerms ? `${termsId}-error` : undefined}
          />
          <label htmlFor={termsId} className="text-sm text-white/70">
            I agree to the Terms of Service and Privacy Policy.
          </label>
        </div>
        <FieldError id={`${termsId}-error`} message={fieldErrors.acceptedTerms} />
      </div>

      <Button type="submit" className="w-full" size="lg" isLoading={isPending}>
        Create account
      </Button>

      <p className="text-center text-sm text-white/60">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
