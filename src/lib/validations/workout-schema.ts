import { z } from "zod";

export const workoutGoalSchema = z.enum([
  "build-strength",
  "lose-fat",
  "improve-conditioning",
  "mobility-recovery",
  "general-fitness",
]);

export const experienceLevelSchema = z.enum(["beginner", "intermediate", "advanced"]);

export const daysPerWeekSchema = z.union([
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
]);

export const workoutPreferencesSchema = z.object({
  goal: workoutGoalSchema,
  experience: experienceLevelSchema,
  daysPerWeek: daysPerWeekSchema,
});

export type WorkoutPreferencesSchema = z.infer<typeof workoutPreferencesSchema>;
