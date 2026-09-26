import { apiRequest } from "@/lib/api/client";
import type { MembershipChangeEvent, MembershipTier } from "@/types/membership";
import type { CustomerProfile } from "@/types/profile";

export async function fetchMembershipHistory(): Promise<MembershipChangeEvent[]> {
  const data = await apiRequest<{ history: MembershipChangeEvent[] }>("/api/membership");
  return data.history;
}

export async function changeMembershipTier(
  tier: MembershipTier
): Promise<{ event: MembershipChangeEvent; profile: CustomerProfile | null }> {
  return apiRequest("/api/membership", { method: "POST", body: JSON.stringify({ tier }) });
}
