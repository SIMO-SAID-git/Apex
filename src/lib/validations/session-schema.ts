import { z } from "zod";

export const createSessionSchema = z.object({
  trainerUsername: z.string().min(1),
  scheduledAt: z.string().datetime({ message: "Invalid date/time." }),
  durationMinutes: z.number().int().min(30).max(120).optional(),
});
