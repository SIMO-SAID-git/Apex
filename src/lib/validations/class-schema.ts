import { z } from "zod";

export const createClassSchema = z.object({
  title: z.string().trim().min(3, "Title is too short.").max(80),
  description: z.string().trim().min(10, "Description is too short.").max(600),
  category: z.enum(["strength", "hiit", "cardio", "zen"]),
  intensity: z.enum(["low", "medium", "high"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use yyyy-MM-dd."),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Use HH:mm."),
  durationMinutes: z.number().int().min(15).max(180),
  capacity: z.number().int().min(1).max(60),
  zoneId: z.string().min(1, "Choose a zone."),
  waitlistCapacity: z.number().int().min(0).max(60).optional(),
});

export const updateClassSchema = createClassSchema.partial();

export type CreateClassSchema = z.infer<typeof createClassSchema>;
export type UpdateClassSchema = z.infer<typeof updateClassSchema>;
