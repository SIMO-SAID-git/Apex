import { randomUUID } from "crypto";
import type { Booking, CreateBookingInput, CreateBookingResult } from "@/types/booking";
import type { FitnessClass } from "@/types/class";
import { deriveClassStatus } from "@/types/class";
import { mockClasses } from "@/data/mock-classes";
import { isMockMode } from "@/config/site";

export interface ClassRepository {
  getClasses(params?: { date?: string }): Promise<FitnessClass[]>;
  getClassById(id: string): Promise<FitnessClass | undefined>;
}

export interface BookingRepository {
  createBooking(input: CreateBookingInput): Promise<CreateBookingResult>;
  cancelBooking(bookingId: string, callerId: string): Promise<void>;
  getBookingsForUser(userId: string): Promise<(Booking & { fitnessClass?: FitnessClass })[]>;
}

/**
 * In-memory mock store. Capacity is always re-validated server-side —
 * the client's view of remaining spots is never trusted.
 */
class InMemoryClassStore {
  private static instance: InMemoryClassStore;
  classes: FitnessClass[];
  bookings: Map<string, Booking> = new Map();

  private constructor() {
    this.classes = mockClasses.map((c) => ({ ...c }));
  }

  static get(): InMemoryClassStore {
    if (!InMemoryClassStore.instance) {
      InMemoryClassStore.instance = new InMemoryClassStore();
    }
    return InMemoryClassStore.instance;
  }
}

export class MockClassRepository implements ClassRepository {
  async getClasses(params?: { date?: string }): Promise<FitnessClass[]> {
    const store = InMemoryClassStore.get();
    if (params?.date) {
      return store.classes.filter((c) => c.date === params.date);
    }
    return store.classes;
  }

  async getClassById(id: string): Promise<FitnessClass | undefined> {
    return InMemoryClassStore.get().classes.find((c) => c.id === id);
  }
}

export class MockBookingRepository implements BookingRepository {
  async createBooking(input: CreateBookingInput): Promise<CreateBookingResult> {
    const store = InMemoryClassStore.get();
    const fitnessClass = store.classes.find((c) => c.id === input.classId);

    if (!fitnessClass) {
      throw new BookingError("CLASS_NOT_FOUND", "This class could not be found.");
    }

    const alreadyBooked = Array.from(store.bookings.values()).some(
      (b) => b.classId === input.classId && b.userId === input.userId && b.status !== "cancelled"
    );
    if (alreadyBooked) {
      throw new BookingError("ALREADY_BOOKED", "You already have a booking for this class.");
    }

    const isWaitlist = fitnessClass.bookedCount >= fitnessClass.capacity;

    if (isWaitlist && fitnessClass.waitlistCount >= fitnessClass.waitlistCapacity) {
      throw new BookingError("CLASS_FULL", "This class and its waitlist are full.");
    }

    if (isWaitlist) {
      fitnessClass.waitlistCount += 1;
    } else {
      fitnessClass.bookedCount += 1;
    }

    fitnessClass.status = deriveClassStatus(fitnessClass);

    const booking: Booking = {
      id: randomUUID(),
      classId: input.classId,
      userId: input.userId,
      status: isWaitlist ? "waitlisted" : "confirmed",
      createdAt: new Date().toISOString(),
    };

    store.bookings.set(booking.id, booking);

    return { booking, classStatus: fitnessClass.status };
  }

  async cancelBooking(bookingId: string, callerId: string): Promise<void> {
    const store = InMemoryClassStore.get();
    const booking = store.bookings.get(bookingId);

    // Returning the same "not found" error whether the booking doesn't
    // exist or simply isn't the caller's own booking — this is what stops
    // a customer from probing for other people's booking ids and learning
    // which ones are real.
    if (!booking || booking.status === "cancelled" || booking.userId !== callerId) {
      throw new BookingError("BOOKING_NOT_FOUND", "This booking could not be found.");
    }

    const fitnessClass = store.classes.find((c) => c.id === booking.classId);
    if (fitnessClass) {
      if (booking.status === "confirmed") {
        fitnessClass.bookedCount = Math.max(0, fitnessClass.bookedCount - 1);
      } else if (booking.status === "waitlisted") {
        fitnessClass.waitlistCount = Math.max(0, fitnessClass.waitlistCount - 1);
      }
      fitnessClass.status = deriveClassStatus(fitnessClass);
    }

    booking.status = "cancelled";
  }

  async getBookingsForUser(userId: string): Promise<(Booking & { fitnessClass?: FitnessClass })[]> {
    const store = InMemoryClassStore.get();
    return Array.from(store.bookings.values())
      .filter((b) => b.userId === userId)
      .map((booking) => ({
        ...booking,
        fitnessClass: store.classes.find((c) => c.id === booking.classId),
      }))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export type BookingErrorCode =
  | "CLASS_NOT_FOUND"
  | "ALREADY_BOOKED"
  | "CLASS_FULL"
  | "BOOKING_NOT_FOUND";

export class BookingError extends Error {
  code: BookingErrorCode;
  constructor(code: BookingErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "BookingError";
  }
}

/**
 * Placeholder for a real booking + payment provider integration. Implementing
 * this class and wiring it up in getBookingRepository() is the only change
 * required to move off the mock — routes, hooks, and UI stay untouched.
 */
export class RemoteBookingRepository implements BookingRepository {
  async createBooking(): Promise<CreateBookingResult> {
    throw new Error(
      "RemoteBookingRepository is not configured. Set PAYMENTS_SECRET_KEY and implement the provider call here."
    );
  }
  async cancelBooking(): Promise<void> {
    throw new Error("RemoteBookingRepository is not configured.");
  }
  async getBookingsForUser(): Promise<(Booking & { fitnessClass?: FitnessClass })[]> {
    throw new Error("RemoteBookingRepository is not configured.");
  }
}

export function getClassRepository(): ClassRepository {
  return new MockClassRepository();
}

export function getBookingRepository(): BookingRepository {
  return isMockMode ? new MockBookingRepository() : new RemoteBookingRepository();
}
