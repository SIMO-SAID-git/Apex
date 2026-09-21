import { apiRequest } from "@/lib/api/client";
import type { ActivityEvent } from "@/types/activity";

export async function fetchActivityFeed(): Promise<ActivityEvent[]> {
  const data = await apiRequest<{ events: ActivityEvent[] }>("/api/activity");
  return data.events;
}
