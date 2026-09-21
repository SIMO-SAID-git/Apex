import type { Occupancy } from "@/types/occupancy";
import { deriveOccupancyStatus } from "@/types/occupancy";

export function buildMockOccupancy(seed: number = Date.now()): Occupancy {
  const capacity = 260;
  // Deterministic-ish oscillation so polling shows gentle, believable movement.
  const wave = Math.sin(seed / 60000) * 0.5 + 0.5;
  const current = Math.round(40 + wave * 190);
  const percentage = Math.round((current / capacity) * 100);

  return {
    current,
    capacity,
    percentage,
    status: deriveOccupancyStatus(percentage),
    updatedAt: new Date().toISOString(),
  };
}
