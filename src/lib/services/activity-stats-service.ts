import "server-only";
import { getBookingRepository } from "@/lib/services/booking-service";

export interface ActivityStats {
  bookingsLast30Days: number;
  cancellationsLast30Days: number;
  classesAttended: number;
  upcomingBookings: number;
}

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Task #9: "30-Day Activity/Booking Statistics." Derived from the existing
 * booking repository rather than a separate analytics table — this app has
 * one source of truth for bookings (see booking-service.ts), and these
 * numbers are just different aggregations of it.
 */
export async function getActivityStats(userId: string): Promise<ActivityStats> {
  const bookings = await getBookingRepository().getBookingsForUser(userId);
  const cutoff = Date.now() - THIRTY_DAYS_MS;
  const todayIso = new Date().toISOString().slice(0, 10);

  let bookingsLast30Days = 0;
  let cancellationsLast30Days = 0;
  let classesAttended = 0;
  let upcomingBookings = 0;

  for (const booking of bookings) {
    const createdAtMs = new Date(booking.createdAt).getTime();
    if (createdAtMs >= cutoff) {
      if (booking.status === "cancelled") {
        cancellationsLast30Days += 1;
      } else {
        bookingsLast30Days += 1;
      }
    }

    if (booking.status === "confirmed" && booking.fitnessClass) {
      if (booking.fitnessClass.date < todayIso) {
        classesAttended += 1;
      } else {
        upcomingBookings += 1;
      }
    }
  }

  return { bookingsLast30Days, cancellationsLast30Days, classesAttended, upcomingBookings };
}
