import { z } from "zod";
import { fitnessGoalSchema } from "@/lib/validations/auth-schema";

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1).max(60).optional(),
  lastName: z.string().trim().min(1).max(60).optional(),
  displayName: z.string().trim().min(1).max(80).optional(),
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[0-9+()\-.\s]*$/, "Enter a valid phone number.")
    .nullable()
    .optional(),
  fitnessGoal: fitnessGoalSchema,
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

export const ALLOWED_AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB
