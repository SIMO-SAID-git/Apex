"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { useProfile, useUpdateProfile, useUploadAvatar, useDeleteAvatar } from "@/hooks/auth/use-profile";
import { updateProfileSchema } from "@/lib/validations/profile-schema";
import { ALLOWED_AVATAR_MIME_TYPES, MAX_AVATAR_BYTES } from "@/lib/validations/profile-schema";
import { Input, Label, FieldError } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { initialsFromName } from "@/lib/utils/formatters";
import type { FitnessGoal } from "@/types/profile";

const GOAL_OPTIONS: { value: FitnessGoal; label: string }[] = [
  { value: "build-strength", label: "Build Strength" },
  { value: "lose-fat", label: "Lose Fat" },
  { value: "improve-conditioning", label: "Improve Conditioning" },
  { value: "mobility-recovery", label: "Mobility & Recovery" },
  { value: "general-fitness", label: "General Fitness" },
];

export function ProfileForm() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal | "">("");
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const firstNameId = useId();
  const lastNameId = useId();
  const displayNameId = useId();
  const phoneId = useId();
  const goalId = useId();

  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setDisplayName(profile.displayName);
    setPhone(profile.phone ?? "");
    setFitnessGoal(profile.fitnessGoal ?? "");
  }, [profile]);

  function handleAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setAvatarError(null);

    if (!ALLOWED_AVATAR_MIME_TYPES.includes(file.type as (typeof ALLOWED_AVATAR_MIME_TYPES)[number])) {
      setAvatarError("Please choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Images must be under 2 MB.");
      return;
    }

    uploadAvatar.mutate(file, {
      onError: () => setAvatarError("Upload failed. Please try a different image."),
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMessage(null);

    const parsed = updateProfileSchema.safeParse({
      firstName,
      lastName,
      displayName,
      phone: phone || null,
      fitnessGoal: fitnessGoal || null,
    });

    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        if (issue.path[0]) errors[issue.path[0] as string] = issue.message;
      }
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});

    updateProfile.mutate(parsed.data, {
      onSuccess: () => setSuccessMessage("Profile updated."),
    });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-20 rounded-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          {profile?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
          ) : (
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/15 text-accent text-xl font-medium">
              {initialsFromName(displayName || "Member")}
            </span>
          )}
          {uploadAvatar.isPending ? (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            </div>
          ) : null}
        </div>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
              <Camera className="h-4 w-4" />
              Change photo
            </Button>
            {profile?.avatarUrl ? (
              <Button type="button" variant="ghost" size="sm" onClick={() => deleteAvatar.mutate()} isLoading={deleteAvatar.isPending}>
                <Trash2 className="h-4 w-4" />
                Remove
              </Button>
            ) : null}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={handleAvatarSelect}
            aria-label="Upload profile photo"
          />
          {avatarError ? <p className="text-xs text-status-peak">{avatarError}</p> : <p className="text-xs text-white/40">JPEG, PNG, or WebP. Max 2 MB.</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={firstNameId}>First name</Label>
          <Input id={firstNameId} autoComplete="given-name" value={firstName} onChange={(e) => setFirstName(e.target.value)} hasError={Boolean(fieldErrors.firstName)} />
          <FieldError id={`${firstNameId}-error`} message={fieldErrors.firstName} />
        </div>
        <div>
          <Label htmlFor={lastNameId}>Last name</Label>
          <Input id={lastNameId} autoComplete="family-name" value={lastName} onChange={(e) => setLastName(e.target.value)} hasError={Boolean(fieldErrors.lastName)} />
          <FieldError id={`${lastNameId}-error`} message={fieldErrors.lastName} />
        </div>
      </div>

      <div>
        <Label htmlFor={displayNameId}>Display name</Label>
        <Input id={displayNameId} value={displayName} onChange={(e) => setDisplayName(e.target.value)} hasError={Boolean(fieldErrors.displayName)} />
        <FieldError id={`${displayNameId}-error`} message={fieldErrors.displayName} />
      </div>

      <div>
        <Label htmlFor={phoneId}>Phone</Label>
        <Input id={phoneId} type="tel" autoComplete="tel" placeholder="Optional" value={phone} onChange={(e) => setPhone(e.target.value)} hasError={Boolean(fieldErrors.phone)} />
        <FieldError id={`${phoneId}-error`} message={fieldErrors.phone} />
      </div>

      <div>
        <Label htmlFor={goalId}>Fitness goal</Label>
        <select
          id={goalId}
          value={fitnessGoal}
          onChange={(e) => setFitnessGoal(e.target.value as FitnessGoal | "")}
          className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-white/20"
        >
          <option value="" className="bg-surface-900">Not set</option>
          {GOAL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-surface-900">
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {successMessage ? (
        <p role="status" className="text-sm text-status-quiet">
          {successMessage}
        </p>
      ) : null}

      <Button type="submit" isLoading={updateProfile.isPending}>
        Save changes
      </Button>
    </form>
  );
}
