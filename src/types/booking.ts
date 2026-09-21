export type BookingStatus = "confirmed" | "waitlisted" | "cancelled";

export interface Booking {
  id: string;
  classId: string;
  userId: string;
  status: BookingStatus;
  createdAt: string;
}

export interface CreateBookingInput {
  classId: string;
  userId: string;
}

export interface CreateBookingResult {
  booking: Booking;
  classStatus: import("./class").ClassStatus;
}
