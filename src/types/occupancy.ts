export type OccupancyStatus = "quiet" | "moderate" | "peak";

export interface Occupancy {
  current: number;
  capacity: number;
  percentage: number;
  status: OccupancyStatus;
  updatedAt: string;
}

export function deriveOccupancyStatus(percentage: number): OccupancyStatus {
  if (percentage < 40) return "quiet";
  if (percentage < 75) return "moderate";
  return "peak";
}
