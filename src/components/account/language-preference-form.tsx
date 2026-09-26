"use client";

import { useEffect, useId, useState } from "react";
import { Languages } from "lucide-react";
import { useProfile, useUpdateProfile } from "@/hooks/auth/use-profile";
import { Label } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "pt", label: "Português" },
];

export function LanguagePreferenceForm() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const [language, setLanguage] = useState("en");
  const [savedMessage, setSavedMessage] = useState(false);
  const selectId = useId();

  useEffect(() => {
    if (profile) setLanguage(profile.languagePreference);
  }, [profile]);

  function handleChange(value: string) {
    setLanguage(value);
    setSavedMessage(false);
    updateProfile.mutate({ languagePreference: value }, { onSuccess: () => setSavedMessage(true) });
  }

  if (isLoading) return <Skeleton className="h-24 w-full rounded-2xl" />;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Languages className="h-4 w-4 text-white/40" />
        <h2 className="text-base font-semibold text-white">Language</h2>
      </div>
      <Label htmlFor={selectId}>Preferred language</Label>
      <select
        id={selectId}
        value={language}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full max-w-xs rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.value} value={lang.value} className="bg-surface-900">
            {lang.label}
          </option>
        ))}
      </select>
      {savedMessage ? <p className="mt-2 text-xs text-status-quiet">Saved.</p> : null}
      <p className="mt-3 text-xs text-white/40">
        This sets your account preference. Full site translation is on our roadmap.
      </p>
    </GlassCard>
  );
}
