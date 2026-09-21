import { apiRequest } from "@/lib/api/client";
import type { CustomerProfile, UpdateProfileInput } from "@/types/profile";

export async function fetchMyProfile(): Promise<CustomerProfile | null> {
  const data = await apiRequest<{ profile: CustomerProfile | null }>("/api/profile");
  return data.profile;
}

export async function updateMyProfile(input: UpdateProfileInput): Promise<CustomerProfile> {
  const data = await apiRequest<{ profile: CustomerProfile }>("/api/profile", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return data.profile;
}

export async function uploadMyAvatar(file: File): Promise<CustomerProfile> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/profile/avatar", { method: "POST", body: formData });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body?.error ?? "Unable to upload avatar.");
  }
  const data = (await response.json()) as { profile: CustomerProfile };
  return data.profile;
}

export async function deleteMyAvatar(): Promise<CustomerProfile> {
  const data = await apiRequest<{ profile: CustomerProfile }>("/api/profile/avatar", { method: "DELETE" });
  return data.profile;
}
