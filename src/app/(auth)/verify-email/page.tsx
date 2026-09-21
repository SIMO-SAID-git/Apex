import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { VerifyEmail } from "@/components/auth/verify-email";
import { AuthLoading } from "@/components/auth/auth-loading";

export const metadata: Metadata = {
  title: "Verify your email",
  robots: { index: false, follow: false },
};

export default function VerifyEmailPage() {
  return (
    <AuthCard>
      <AuthHeader title="Check your inbox" />
      <Suspense fallback={<AuthLoading />}>
        <VerifyEmail />
      </Suspense>
    </AuthCard>
  );
}
