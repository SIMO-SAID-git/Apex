import { apiRequest } from "@/lib/api/client";
import type { Booking, CreateBookingResult } from "@/types/booking";
import type { FitnessClass } from "@/types/class";

export async function fetchMyBookings(): Promise<(Booking & { fitnessClass?: FitnessClass })[]> {
  const data = await apiRequest<{ bookings: (Booking & { fitnessClass?: FitnessClass })[] }>("/api/bookings");
  return data.bookings;
}

/** The server derives the authenticated user from the session — a classId is all a customer ever sends. */
export async function createBooking(input: { classId: string }): Promise<CreateBookingResult> {
  return apiRequest<CreateBookingResult>("/api/bookings", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function cancelBooking(bookingId: string): Promise<void> {
  await apiRequest<{ success: true }>(`/api/bookings/${bookingId}`, { method: "DELETE" });
}
