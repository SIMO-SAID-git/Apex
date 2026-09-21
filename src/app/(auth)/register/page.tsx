import type { Metadata } from "next";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthHeader } from "@/components/auth/auth-header";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create your Apex Performance Club account.",
};

export default function RegisterPage() {
  return (
    <AuthCard>
      <AuthHeader title="Create your account" subtitle="Join the club to book classes and track your training." />
      <RegisterForm />
    </AuthCard>
  );
}
