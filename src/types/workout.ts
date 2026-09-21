export type WorkoutGoal =
  | "build-strength"
  | "lose-fat"
  | "improve-conditioning"
  | "mobility-recovery"
  | "general-fitness";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export type DaysPerWeek = 2 | 3 | 4 | 5 | 6;

export type MuscleGroup =
  | "chest"
  | "back"
  | "legs"
  | "shoulders"
  | "arms"
  | "core";

export interface WorkoutPreferences {
  goal: WorkoutGoal;
  experience: ExperienceLevel;
  daysPerWeek: DaysPerWeek;
}

export interface PlannedSession {
  day: number; // 1-7
  focus: string;
  category: import("./class").ClassCategory;
  intensity: import("./class").Intensity;
  durationMinutes: number;
  isRecovery: boolean;
}

export interface MuscleDistribution {
  group: MuscleGroup;
  percentage: number;
}

export interface IntensityDistribution {
  low: number;
  medium: number;
  high: number;
}

export interface GeneratedWorkoutPlan {
  id: string;
  preferences: WorkoutPreferences;
  sessions: PlannedSession[];
  estimatedWeeklyCalories: number;
  muscleDistribution: MuscleDistribution[];
  intensityDistribution: IntensityDistribution;
  rationale: string[];
  recoveryDaysPerWeek: number;
  generatedAt: string;
  /** Estimates only, not medical advice. */
  isEstimate: true;
}
