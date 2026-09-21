import { apiRequest } from "@/lib/api/client";
import type { Occupancy } from "@/types/occupancy";

export async function fetchOccupancy(): Promise<Occupancy> {
  return apiRequest<Occupancy>("/api/occupancy");
}
