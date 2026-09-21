import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your Apex Performance Club account password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthCard>
      <AuthHeader title="Forgot your password?" subtitle="Enter your email and we'll send you a reset link." />
      <ForgotPasswordForm />
    </AuthCard>
  );
}
