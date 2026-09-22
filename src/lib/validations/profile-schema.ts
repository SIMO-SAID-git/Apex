import { z } from "zod";
import { fitnessGoalSchema } from "@/lib/validations/auth-schema";

const socialLinksSchema = z.object({
  instagram: z.string().trim().max(200).url().optional().or(z.literal("")),
  website: z.string().trim().max(200).url().optional().or(z.literal("")),
  youtube: z.string().trim().max(200).url().optional().or(z.literal("")),
});

const availabilityWindowSchema = z.object({
  day: z.enum(["mon", "tue", "wed", "thu", "fri", "sat", "sun"]),
  start: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:mm."),
  end: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:mm."),
});

/** Only ever applied server-side when the caller's own role is "trainer" — see /api/profile's PATCH handler. */
export const trainerDetailsSchema = z.object({
  bio: z.string().trim().max(1000).optional(),
  specialties: z.array(z.enum(["strength", "hiit", "cardio", "zen"])).max(4).optional(),
  certifications: z.array(z.string().trim().max(120)).max(20).optional(),
  hourlyRate: z.number().min(0).max(1000).nullable().optional(),
  socialLinks: socialLinksSchema.optional(),
  availability: z.array(availabilityWindowSchema).max(20).optional(),
});

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
  trainer: trainerDetailsSchema.optional(),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;

export const ALLOWED_AVATAR_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB
