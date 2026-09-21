"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MailCheck } from "lucide-react";
import { useAuthActions } from "@/hooks/auth/use-auth-actions";
import { AuthErrorBanner } from "@/components/auth/auth-error";
import { Button } from "@/components/ui/button";
import { isMockMode } from "@/config/site";

const RESEND_COOLDOWN_SECONDS = 30;

export function VerifyEmail() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const { resendVerificationEmail, isPending, error, clearError } = useAuthActions();

  const [cooldown, setCooldown] = useState(0);
  const [didResend, setDidResend] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleResend() {
    clearError();
    const result = await resendVerificationEmail(email);
    if (result !== null) {
      setDidResend(true);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    }
  }

  return (
    <div className="text-center space-y-6">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent mx-auto">
        <MailCheck className="h-6 w-6" />
      </div>

      <div>
        <p className="text-sm text-white/70">We sent a verification link to</p>
        <p className="text-white font-medium mt-1">{email || "your email"}</p>
      </div>

      <p className="text-sm text-white/60">
        Click the link in that email to activate your account, then come back and sign in.
      </p>

      <AuthErrorBanner error={error} />

      {didResend ? (
        <p className="text-sm text-status-quiet" role="status">
          {isMockMode
            ? "Mock mode: your account has been marked verified. You can sign in now."
            : "Verification email resent. Check your inbox (and spam folder)."}
        </p>
      ) : null}

      <div className="space-y-3">
        <Button
          variant="secondary"
          className="w-full"
          onClick={handleResend}
          isLoading={isPending}
          disabled={cooldown > 0}
        >
          {cooldown > 0 ? `Resend available in ${cooldown}s` : "Resend verification email"}
        </Button>

        <div className="flex items-center justify-center gap-4 text-sm">
          <Link href="/register" className="text-white/50 hover:text-white transition-colors">
            Change email
          </Link>
          <span className="text-white/20" aria-hidden>
            ·
          </span>
          <Link href="/login" className="text-accent hover:underline">
            Return to login
          </Link>
        </div>
      </div>
    </div>
  );
}
