import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { LoginForm } from "@/components/auth/login-form";
import { AuthLoading } from "@/components/auth/auth-loading";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Apex Performance Club account.",
};

export default function LoginPage() {
  return (
    <AuthCard>
      <AuthHeader title="Welcome back" subtitle="Sign in to book classes and manage your account." />
      <Suspense fallback={<AuthLoading label="Loading…" />}>
        <LoginForm />
      </Suspense>
    </AuthCard>
  );
}
