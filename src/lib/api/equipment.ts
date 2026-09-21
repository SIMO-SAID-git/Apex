import { apiRequest } from "@/lib/api/client";
import type { FacilityZone, TrafficStats } from "@/types/facility";

export async function fetchFacilityData(): Promise<{ zones: FacilityZone[]; traffic: TrafficStats[] }> {
  return apiRequest<{ zones: FacilityZone[]; traffic: TrafficStats[] }>("/api/equipment");
}
