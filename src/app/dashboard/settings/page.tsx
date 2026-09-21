import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { ProfileCard } from "@/components/account/profile-card";
import { ProfileForm } from "@/components/account/profile-form";
import { AccountSettings } from "@/components/account/account-settings";
import { GlassCard } from "@/components/ui/glass-card";

export const metadata: Metadata = {
  title: "Account Settings",
  robots: { index: false, follow: false },
};

export default function SettingsPage() {
  return (
    <PageContainer className="py-16 max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-display font-medium mb-2">Account Settings</h1>
        <p className="text-white/60">Manage your profile, security, and account.</p>
      </div>

      <ProfileCard />

      <GlassCard className="p-6">
        <h2 className="text-base font-semibold text-white mb-5">Profile</h2>
        <ProfileForm />
      </GlassCard>

      <AccountSettings />
    </PageContainer>
  );
}
