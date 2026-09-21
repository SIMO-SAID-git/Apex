import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return (
    <AuthCard>
      <AuthHeader title="Set a new password" subtitle="Choose a strong password for your account." />
      <ResetPasswordForm />
    </AuthCard>
  );
}
