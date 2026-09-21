import type { ClassCategory, FitnessClass, Intensity } from "@/types/class";
import { deriveClassStatus } from "@/types/class";
import { getCurrentWeek } from "@/lib/utils/dates";

interface ClassSeed {
  dayIndex: number; // 0 = Monday
  title: string;
  description: string;
  category: ClassCategory;
  intensity: Intensity;
  durationMinutes: number;
  startTime: string;
  instructorId: string;
  capacity: number;
  bookedCount: number;
  waitlistCapacity: number;
  waitlistCount: number;
  zoneId: string;
}

const seeds: ClassSeed[] = [
  { dayIndex: 0, title: "Foundations Barbell", description: "Squat, bench, and deadlift technique work with progressive loading.", category: "strength", intensity: "medium", durationMinutes: 60, startTime: "06:00", instructorId: "ins-01", capacity: 12, bookedCount: 5, waitlistCapacity: 4, waitlistCount: 0, zoneId: "zone-iron" },
  { dayIndex: 0, title: "Metcon Sprint", description: "Short, high-output intervals across rowing, sleds, and bodyweight movement.", category: "hiit", intensity: "high", durationMinutes: 45, startTime: "07:00", instructorId: "ins-02", capacity: 16, bookedCount: 16, waitlistCapacity: 6, waitlistCount: 2, zoneId: "zone-functional" },
  { dayIndex: 0, title: "Boxing Fundamentals", description: "Stance, footwork, and combinations on heavy bags.", category: "cardio", intensity: "medium", durationMinutes: 50, startTime: "18:00", instructorId: "ins-03", capacity: 14, bookedCount: 9, waitlistCapacity: 4, waitlistCount: 0, zoneId: "zone-boxing" },
  { dayIndex: 0, title: "Evening Flow", description: "Slow, breath-led mobility to close out the day.", category: "zen", intensity: "low", durationMinutes: 45, startTime: "19:30", instructorId: "ins-04", capacity: 18, bookedCount: 6, waitlistCapacity: 4, waitlistCount: 0, zoneId: "zone-recovery" },

  { dayIndex: 1, title: "Heavy Iron Pit", description: "Max-effort lower body strength session with spotter support.", category: "strength", intensity: "high", durationMinutes: 60, startTime: "06:30", instructorId: "ins-05", capacity: 10, bookedCount: 10, waitlistCapacity: 4, waitlistCount: 1, zoneId: "zone-iron" },
  { dayIndex: 1, title: "Endurance Ride", description: "Sustained zone-2 effort on the cardio deck.", category: "cardio", intensity: "low", durationMinutes: 45, startTime: "12:00", instructorId: "ins-06", capacity: 20, bookedCount: 8, waitlistCapacity: 5, waitlistCount: 0, zoneId: "zone-cardio" },
  { dayIndex: 1, title: "Functional HIIT", description: "Kettlebells, sleds, and battle ropes in short, brutal rounds.", category: "hiit", intensity: "high", durationMinutes: 40, startTime: "17:30", instructorId: "ins-07", capacity: 16, bookedCount: 13, waitlistCapacity: 5, waitlistCount: 0, zoneId: "zone-functional" },
  { dayIndex: 1, title: "Restorative Stretch", description: "Guided static stretching and breathwork.", category: "zen", intensity: "low", durationMinutes: 40, startTime: "20:00", instructorId: "ins-04", capacity: 18, bookedCount: 4, waitlistCapacity: 4, waitlistCount: 0, zoneId: "zone-recovery" },

  { dayIndex: 2, title: "Olympic Lifting", description: "Clean & jerk and snatch technique for intermediate lifters.", category: "strength", intensity: "high", durationMinutes: 60, startTime: "06:00", instructorId: "ins-01", capacity: 8, bookedCount: 6, waitlistCapacity: 3, waitlistCount: 0, zoneId: "zone-iron" },
  { dayIndex: 2, title: "Boxing Conditioning", description: "Bag rounds paired with core and footwork drills.", category: "cardio", intensity: "high", durationMinutes: 50, startTime: "07:15", instructorId: "ins-03", capacity: 14, bookedCount: 12, waitlistCapacity: 4, waitlistCount: 0, zoneId: "zone-boxing" },
  { dayIndex: 2, title: "HIIT Circuit", description: "Full-body circuit with minimal rest across six stations.", category: "hiit", intensity: "medium", durationMinutes: 45, startTime: "18:30", instructorId: "ins-02", capacity: 16, bookedCount: 7, waitlistCapacity: 5, waitlistCount: 0, zoneId: "zone-functional" },

  { dayIndex: 3, title: "Strength Fundamentals", description: "Beginner-friendly barbell and dumbbell strength patterns.", category: "strength", intensity: "low", durationMinutes: 50, startTime: "09:00", instructorId: "ins-05", capacity: 14, bookedCount: 3, waitlistCapacity: 4, waitlistCount: 0, zoneId: "zone-iron" },
  { dayIndex: 3, title: "Sprint Intervals", description: "Track-inspired sprint and recovery intervals on the cardio deck.", category: "cardio", intensity: "high", durationMinutes: 40, startTime: "17:00", instructorId: "ins-06", capacity: 18, bookedCount: 18, waitlistCapacity: 6, waitlistCount: 6, zoneId: "zone-cardio" },
  { dayIndex: 3, title: "Cold Plunge Recovery", description: "Guided contrast therapy session with breathwork coaching.", category: "zen", intensity: "low", durationMinutes: 30, startTime: "19:00", instructorId: "ins-04", capacity: 8, bookedCount: 5, waitlistCapacity: 3, waitlistCount: 0, zoneId: "zone-plunge" },

  { dayIndex: 4, title: "Power Hour", description: "Explosive lifts and plyometrics for advanced athletes.", category: "strength", intensity: "high", durationMinutes: 60, startTime: "06:00", instructorId: "ins-01", capacity: 10, bookedCount: 4, waitlistCapacity: 3, waitlistCount: 0, zoneId: "zone-iron" },
  { dayIndex: 4, title: "Boxing & Bags", description: "Combination work and pad rounds with a partner.", category: "cardio", intensity: "medium", durationMinutes: 50, startTime: "18:00", instructorId: "ins-03", capacity: 14, bookedCount: 10, waitlistCapacity: 4, waitlistCount: 0, zoneId: "zone-boxing" },
  { dayIndex: 4, title: "Total Body HIIT", description: "Time-capped rounds combining strength and conditioning.", category: "hiit", intensity: "medium", durationMinutes: 45, startTime: "12:15", instructorId: "ins-07", capacity: 16, bookedCount: 9, waitlistCapacity: 5, waitlistCount: 0, zoneId: "zone-functional" },
  { dayIndex: 4, title: "Friday Flow", description: "A slower, longer mobility session to end the work week.", category: "zen", intensity: "low", durationMinutes: 50, startTime: "19:30", instructorId: "ins-04", capacity: 18, bookedCount: 8, waitlistCapacity: 4, waitlistCount: 0, zoneId: "zone-recovery" },

  { dayIndex: 5, title: "Weekend Warm-Up", description: "Moderate full-body strength session for the weekend.", category: "strength", intensity: "medium", durationMinutes: 55, startTime: "09:00", instructorId: "ins-05", capacity: 14, bookedCount: 5, waitlistCapacity: 4, waitlistCount: 0, zoneId: "zone-iron" },
  { dayIndex: 5, title: "Saturday HIIT", description: "High-energy group HIIT with music-driven pacing.", category: "hiit", intensity: "high", durationMinutes: 45, startTime: "10:15", instructorId: "ins-02", capacity: 20, bookedCount: 17, waitlistCapacity: 6, waitlistCount: 0, zoneId: "zone-functional" },
  { dayIndex: 5, title: "Long Ride", description: "Extended endurance ride on the cardio deck.", category: "cardio", intensity: "low", durationMinutes: 60, startTime: "11:30", instructorId: "ins-06", capacity: 20, bookedCount: 6, waitlistCapacity: 5, waitlistCount: 0, zoneId: "zone-cardio" },

  { dayIndex: 6, title: "Sunday Reset", description: "Full mobility, breathwork, and cold plunge closer.", category: "zen", intensity: "low", durationMinutes: 60, startTime: "10:00", instructorId: "ins-04", capacity: 16, bookedCount: 7, waitlistCapacity: 4, waitlistCount: 0, zoneId: "zone-recovery" },
  { dayIndex: 6, title: "Sunday Strength", description: "Relaxed-pace strength maintenance session.", category: "strength", intensity: "low", durationMinutes: 50, startTime: "11:00", instructorId: "ins-01", capacity: 12, bookedCount: 2, waitlistCapacity: 3, waitlistCount: 0, zoneId: "zone-iron" },
];

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = (h ?? 0) * 60 + (m ?? 0) + minutes;
  const hh = Math.floor(total / 60) % 24;
  const mm = total % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function buildMockClasses(): FitnessClass[] {
  const week = getCurrentWeek();

  return seeds.map((seed, index) => {
    const day = week[seed.dayIndex];
    if (!day) throw new Error("Invalid day index in class seed data");

    const status = deriveClassStatus({
      capacity: seed.capacity,
      bookedCount: seed.bookedCount,
      waitlistCount: seed.waitlistCount,
      waitlistCapacity: seed.waitlistCapacity,
    });

    const fitnessClass: FitnessClass = {
      id: `cls-${String(index + 1).padStart(2, "0")}`,
      title: seed.title,
      description: seed.description,
      category: seed.category,
      intensity: seed.intensity,
      durationMinutes: seed.durationMinutes,
      startTime: seed.startTime,
      endTime: addMinutes(seed.startTime, seed.durationMinutes),
      date: day.date,
      instructorId: seed.instructorId,
      capacity: seed.capacity,
      bookedCount: seed.bookedCount,
      waitlistCount: seed.waitlistCount,
      waitlistCapacity: seed.waitlistCapacity,
      status,
      zoneId: seed.zoneId,
    };

    return fitnessClass;
  });
}

export const mockClasses: FitnessClass[] = buildMockClasses();
