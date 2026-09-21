import type { Occupancy } from "@/types/occupancy";
import { buildMockOccupancy } from "@/data/mock-occupancy";
import { isMockMode } from "@/config/site";

/**
 * Repository abstraction so the rest of the app depends on this interface,
 * never on a concrete mock or Supabase implementation directly.
 */
export interface OccupancyRepository {
  getOccupancy(): Promise<Occupancy>;
}

export class MockOccupancyRepository implements OccupancyRepository {
  async getOccupancy(): Promise<Occupancy> {
    return buildMockOccupancy(Date.now());
  }
}

/**
 * Placeholder for a production repository backed by a Supabase table (or any
 * REST source). Swapping this in for MockOccupancyRepository requires no
 * changes to routes, hooks, or components — only to `getOccupancyRepository`.
 */
export class SupabaseOccupancyRepository implements OccupancyRepository {
  async getOccupancy(): Promise<Occupancy> {
    throw new Error(
      "SupabaseOccupancyRepository requires SUPABASE_SERVICE_ROLE_KEY and a configured 'occupancy' table. " +
        "Implement the query here, then flip NEXT_PUBLIC_USE_MOCK_DATA to \"false\"."
    );
  }
}

export function getOccupancyRepository(): OccupancyRepository {
  return isMockMode ? new MockOccupancyRepository() : new SupabaseOccupancyRepository();
}
