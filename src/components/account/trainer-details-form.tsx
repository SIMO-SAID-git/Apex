"use client";

import { useEffect, useId, useState } from "react";
import { useUpdateProfile } from "@/hooks/auth/use-profile";
import { trainerDetailsSchema } from "@/lib/validations/profile-schema";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { cn } from "@/lib/utils/cn";
import type { CustomerProfile } from "@/types/profile";
import type { TrainerSpecialty } from "@/types/profile";

const SPECIALTY_OPTIONS: { value: TrainerSpecialty; label: string }[] = [
  { value: "strength", label: "Strength" },
  { value: "hiit", label: "HIIT" },
  { value: "cardio", label: "Cardio" },
  { value: "zen", label: "Zen" },
];

/**
 * Only ever rendered when the signed-in customer's own profile.role is
 * "trainer" (see profile-form.tsx) — this form's fields are exactly the
 * public marketing surface shown on /profile/[username] for trainers.
 */
export function TrainerDetailsForm({ profile }: { profile: CustomerProfile }) {
  const updateProfile = useUpdateProfile();

  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState<TrainerSpecialty[]>([]);
  const [certifications, setCertifications] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const bioId = useId();
  const rateId = useId();
  const certsId = useId();

  useEffect(() => {
    const trainer = profile.trainer;
    if (!trainer) return;
    setBio(trainer.bio);
    setSpecialties(trainer.specialties);
    setCertifications(trainer.certifications.join(", "));
    setHourlyRate(trainer.hourlyRate != null ? String(trainer.hourlyRate) : "");
    setInstagram(trainer.socialLinks.instagram ?? "");
    setWebsite(trainer.socialLinks.website ?? "");
  }, [profile.trainer]);

  function toggleSpecialty(value: TrainerSpecialty) {
    setSpecialties((current) =>
      current.includes(value) ? current.filter((s) => s !== value) : [...current, value]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const parsed = trainerDetailsSchema.safeParse({
      bio,
      specialties,
      certifications: certifications
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean),
      hourlyRate: hourlyRate ? Number(hourlyRate) : null,
      socialLinks: { instagram: instagram || undefined, website: website || undefined },
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Invalid trainer details.");
      return;
    }

    updateProfile.mutate(
      { trainer: parsed.data },
      {
        onSuccess: () => setSuccessMessage("Trainer profile updated."),
        onError: () => setError("Unable to save your trainer details right now."),
      }
    );
  }

  return (
    <GlassCard className="p-6">
      <h2 className="text-base font-semibold text-white mb-1">Trainer profile</h2>
      <p className="text-sm text-white/50 mb-5">
        This is what members see on your public profile at /profile/{profile.username}.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor={bioId}>Bio</Label>
          <textarea
            id={bioId}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            maxLength={1000}
            className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-white/20"
            placeholder="Tell members about your coaching style and experience."
          />
        </div>

        <div>
          <Label>Specialties</Label>
          <div className="flex flex-wrap gap-2">
            {SPECIALTY_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                aria-pressed={specialties.includes(opt.value)}
                onClick={() => toggleSpecialty(opt.value)}
                className={cn(
                  "rounded-full px-3.5 py-2 text-sm transition-colors",
                  specialties.includes(opt.value)
                    ? "bg-accent text-surface-950 font-medium"
                    : "bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label htmlFor={certsId}>Certifications</Label>
          <Input
            id={certsId}
            value={certifications}
            onChange={(e) => setCertifications(e.target.value)}
            placeholder="NASM-CPT, USAW Level 1"
          />
          <p className="mt-1.5 text-xs text-white/40">Comma-separated.</p>
        </div>

        <div>
          <Label htmlFor={rateId}>Hourly rate (USD)</Label>
          <Input
            id={rateId}
            type="number"
            min={0}
            max={1000}
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            placeholder="Optional"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Instagram URL</Label>
            <Input value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="Optional" />
          </div>
          <div>
            <Label>Website URL</Label>
            <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="Optional" />
          </div>
        </div>

        <FieldError id={`${bioId}-error`} message={error ?? undefined} />
        {successMessage ? (
          <p role="status" className="text-sm text-status-quiet">
            {successMessage}
          </p>
        ) : null}

        <Button type="submit" isLoading={updateProfile.isPending}>
          Save trainer profile
        </Button>
      </form>
    </GlassCard>
  );
}
