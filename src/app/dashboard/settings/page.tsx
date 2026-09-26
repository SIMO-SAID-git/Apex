import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/page-container";
import { LanguagePreferenceForm } from "@/components/account/language-preference-form";
import { ProfileViewersCard } from "@/components/account/profile-viewers-card";
import { ActivityStatsCard } from "@/components/account/activity-stats-card";
import { AccountSettings } from "@/components/account/account-settings";

export const metadata: Metadata = {
  title: "Account Settings",
  robots: { index: false, follow: false },
};

/**
 * Task #9: settings is re-focused strictly on language, profile viewers, and
 * 30-day activity stats. Editing basic profile info (name, bio, avatar,
 * trainer details) now lives in-page on /profile/[username] — see
 * ProfileOwnerPanel — rather than redirecting here. Security actions
 * (password, delete account) stay on this page since they're account
 * security, not profile content.
 */
export default function SettingsPage() {
  return (
    <PageContainer className="py-16 max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-display font-medium mb-2">Account Settings</h1>
        <p className="text-white/60">Language, profile activity, and account security.</p>
      </div>

      <LanguagePreferenceForm />
      <ProfileViewersCard />
      <ActivityStatsCard />
      <AccountSettings />
    </PageContainer>
  );
}
