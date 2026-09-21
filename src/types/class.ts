export type ClassCategory = "strength" | "hiit" | "cardio" | "zen";

export type Intensity = "low" | "medium" | "high";

export type ClassStatus = "available" | "limited" | "waitlist" | "full";

export interface FitnessClass {
  id: string;
  title: string;
  description: string;
  category: ClassCategory;
  intensity: Intensity;
  durationMinutes: number;
  startTime: string; // "HH:mm"
  endTime: string; // "HH:mm"
  date: string; // ISO date "yyyy-MM-dd"
  instructorId: string;
  capacity: number;
  bookedCount: number;
  waitlistCount: number;
  waitlistCapacity: number;
  status: ClassStatus;
  zoneId: string;
}

export interface ClassQuery {
  date?: string;
  categories?: ClassCategory[];
  intensities?: Intensity[];
  instructorIds?: string[];
}

/**
 * Derives class status from raw booking counts rather than allowing status to
 * be set manually anywhere in the UI. This is the single source of truth.
 */
export function deriveClassStatus(input: {
  capacity: number;
  bookedCount: number;
  waitlistCount: number;
  waitlistCapacity: number;
}): ClassStatus {
  const { capacity, bookedCount, waitlistCount, waitlistCapacity } = input;

  if (bookedCount < capacity) {
    const remaining = capacity - bookedCount;
    return remaining <= Math.max(2, Math.round(capacity * 0.15))
      ? "limited"
      : "available";
  }

  if (waitlistCount < waitlistCapacity) {
    return "waitlist";
  }

  return "full";
}

export function classStatusLabel(status: ClassStatus, spotsLeft: number): string {
  switch (status) {
    case "available":
      return spotsLeft === 1 ? "1 Spot Left" : "Available";
    case "limited":
      return spotsLeft === 1 ? "1 Spot Left" : `${spotsLeft} Spots Left`;
    case "waitlist":
      return "Waitlist";
    case "full":
      return "Waitlist Full";
  }
}
