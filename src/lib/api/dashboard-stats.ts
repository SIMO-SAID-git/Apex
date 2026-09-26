import { apiRequest } from "@/lib/api/client";
import type { ProfileViewStats } from "@/lib/services/profile-view-service";
import type { ActivityStats } from "@/lib/services/activity-stats-service";

export async function fetchProfileViewStats(): Promise<ProfileViewStats> {
  return apiRequest<ProfileViewStats>("/api/profile/views");
}

export async function fetchActivityStats(): Promise<ActivityStats> {
  return apiRequest<ActivityStats>("/api/dashboard/activity-stats");
}
