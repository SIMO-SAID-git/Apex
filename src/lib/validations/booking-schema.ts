import { z } from "zod";

export const createBookingSchema = z.object({
  classId: z.string().min(1, "classId is required"),
});

export type CreateBookingSchema = z.infer<typeof createBookingSchema>;

export const cancelBookingParamsSchema = z.object({
  id: z.string().min(1, "booking id is required"),
});
