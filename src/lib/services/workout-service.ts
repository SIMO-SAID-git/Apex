import { randomUUID } from "crypto";
import type {
  DaysPerWeek,
  ExperienceLevel,
  GeneratedWorkoutPlan,
  IntensityDistribution,
  MuscleDistribution,
  MuscleGroup,
  PlannedSession,
  WorkoutGoal,
  WorkoutPreferences,
} from "@/types/workout";
import type { ClassCategory, Intensity } from "@/types/class";

interface GoalProfile {
  focusOrder: ClassCategory[];
  muscleWeights: Record<MuscleGroup, number>;
  intensityBias: Record<Intensity, number>;
  caloriesPerMinute: number;
  rationale: string;
}

const GOAL_PROFILES: Record<WorkoutGoal, GoalProfile> = {
  "build-strength": {
    focusOrder: ["strength", "strength", "hiit", "strength", "zen"],
    muscleWeights: { chest: 20, back: 22, legs: 26, shoulders: 14, arms: 12, core: 6 },
    intensityBias: { low: 0.1, medium: 0.35, high: 0.55 },
    caloriesPerMinute: 7,
    rationale: "Prioritizes compound barbell strength work with enough volume to drive progressive overload, balanced by recovery.",
  },
  "lose-fat": {
    focusOrder: ["hiit", "cardio", "hiit", "strength", "cardio"],
    muscleWeights: { chest: 14, back: 14, legs: 22, shoulders: 12, arms: 10, core: 28 },
    intensityBias: { low: 0.15, medium: 0.35, high: 0.5 },
    caloriesPerMinute: 10,
    rationale: "Leans on high energy-expenditure conditioning work while keeping one strength session to preserve lean mass.",
  },
  "improve-conditioning": {
    focusOrder: ["cardio", "hiit", "cardio", "hiit", "zen"],
    muscleWeights: { chest: 12, back: 14, legs: 24, shoulders: 12, arms: 10, core: 28 },
    intensityBias: { low: 0.2, medium: 0.4, high: 0.4 },
    caloriesPerMinute: 9,
    rationale: "Builds aerobic and anaerobic capacity through repeated cardio and interval sessions.",
  },
  "mobility-recovery": {
    focusOrder: ["zen", "zen", "strength", "zen"],
    muscleWeights: { chest: 12, back: 18, legs: 20, shoulders: 16, arms: 8, core: 26 },
    intensityBias: { low: 0.6, medium: 0.3, high: 0.1 },
    caloriesPerMinute: 4,
    rationale: "Centers on mobility, breathwork, and light strength maintenance to support joint health and recovery.",
  },
  "general-fitness": {
    focusOrder: ["strength", "cardio", "hiit", "zen"],
    muscleWeights: { chest: 17, back: 17, legs: 22, shoulders: 14, arms: 12, core: 18 },
    intensityBias: { low: 0.3, medium: 0.45, high: 0.25 },
    caloriesPerMinute: 7,
    rationale: "Rotates evenly across all training styles for balanced, sustainable general fitness.",
  },
};

const EXPERIENCE_DURATION: Record<ExperienceLevel, number> = {
  beginner: 40,
  intermediate: 50,
  advanced: 60,
};

const EXPERIENCE_INTENSITY_CAP: Record<ExperienceLevel, Intensity> = {
  beginner: "medium",
  intermediate: "high",
  advanced: "high",
};

const FOCUS_LABEL: Record<ClassCategory, string> = {
  strength: "Strength",
  hiit: "Conditioning (HIIT)",
  cardio: "Cardio Endurance",
  zen: "Mobility & Recovery",
};

const intensityRank: Record<Intensity, number> = { low: 0, medium: 1, high: 2 };

function capIntensity(intensity: Intensity, cap: Intensity): Intensity {
  return intensityRank[intensity] > intensityRank[cap] ? cap : intensity;
}

function pickIntensity(bias: Record<Intensity, number>, seed: number): Intensity {
  const roll = ((seed * 9301 + 49297) % 233280) / 233280;
  if (roll < bias.high) return "high";
  if (roll < bias.high + bias.medium) return "medium";
  return "low";
}

/**
 * Deterministic mock recommendation engine. Isolated here so it can later be
 * swapped for an AI/API-backed service without touching the wizard UI.
 */
export function generateWorkoutPlan(preferences: WorkoutPreferences): GeneratedWorkoutPlan {
  const profile = GOAL_PROFILES[preferences.goal];
  const duration = EXPERIENCE_DURATION[preferences.experience];
  const intensityCap = EXPERIENCE_INTENSITY_CAP[preferences.experience];

  const trainingDays = spreadDaysAcrossWeek(preferences.daysPerWeek);
  const sessions: PlannedSession[] = trainingDays.map((day, index) => {
    const category = profile.focusOrder[index % profile.focusOrder.length]!;
    const rawIntensity = pickIntensity(profile.intensityBias, index + preferences.daysPerWeek);
    const intensity = capIntensity(rawIntensity, intensityCap);

    return {
      day,
      focus: FOCUS_LABEL[category],
      category,
      intensity,
      durationMinutes: duration,
      isRecovery: false,
    };
  });

  const recoveryDays = [1, 2, 3, 4, 5, 6, 7].filter((d) => !trainingDays.includes(d));

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const estimatedWeeklyCalories = Math.round(totalMinutes * profile.caloriesPerMinute);

  const muscleDistribution: MuscleDistribution[] = (
    Object.entries(profile.muscleWeights) as [MuscleGroup, number][]
  ).map(([group, percentage]) => ({ group, percentage }));

  const intensityDistribution: IntensityDistribution = sessions.reduce(
    (acc, session) => {
      acc[session.intensity] += 1;
      return acc;
    },
    { low: 0, medium: 0, high: 0 } as IntensityDistribution
  );

  const rationale = [
    profile.rationale,
    `${preferences.daysPerWeek} training days per week with ${recoveryDays.length} recovery day${recoveryDays.length === 1 ? "" : "s"} spaced between sessions.`,
    `Sessions are capped at ${intensityCap} intensity based on your ${preferences.experience} experience level.`,
  ];

  return {
    id: randomUUID(),
    preferences,
    sessions,
    estimatedWeeklyCalories,
    muscleDistribution,
    intensityDistribution,
    rationale,
    recoveryDaysPerWeek: recoveryDays.length,
    generatedAt: new Date().toISOString(),
    isEstimate: true,
  };
}

/** Spreads N training days as evenly as possible across a 7-day week (1-7). */
export function spreadDaysAcrossWeek(daysPerWeek: DaysPerWeek): number[] {
  const interval = 7 / daysPerWeek;
  const days = new Set<number>();
  for (let i = 0; i < daysPerWeek; i++) {
    const day = Math.max(1, Math.min(7, Math.round(1 + i * interval)));
    days.add(day);
  }
  // Guarantee exact count in case of rounding collisions.
  let candidate = 1;
  while (days.size < daysPerWeek && candidate <= 7) {
    if (!days.has(candidate)) days.add(candidate);
    candidate += 1;
  }
  return Array.from(days).sort((a, b) => a - b);
}
