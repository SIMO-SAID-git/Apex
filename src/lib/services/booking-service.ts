import { randomUUID } from "crypto";
import type { Booking, CreateBookingInput, CreateBookingResult } from "@/types/booking";
import type { FitnessClass, ClassCategory, Intensity } from "@/types/class";
import { deriveClassStatus } from "@/types/class";
import { mockClasses } from "@/data/mock-classes";
import { isMockMode } from "@/config/site";
import { createNotification } from "@/lib/services/notification-service";

export interface CreateClassInput {
  title: string;
  description: string;
  category: ClassCategory;
  intensity: Intensity;
  date: string;
  startTime: string;
  durationMinutes: number;
  capacity: number;
  zoneId: string;
  waitlistCapacity?: number;
}

export type UpdateClassInput = Partial<CreateClassInput>;

export interface ClassRepository {
  getClasses(params?: { date?: string; instructorId?: string; includeUnpublished?: boolean }): Promise<FitnessClass[]>;
  getClassById(id: string): Promise<FitnessClass | undefined>;
  createClass(trainerUserId: string, input: CreateClassInput): Promise<FitnessClass>;
  updateClass(classId: string, trainerUserId: string, input: UpdateClassInput): Promise<FitnessClass>;
  publishClass(classId: string, trainerUserId: string): Promise<FitnessClass>;
  cancelClass(classId: string, trainerUserId: string): Promise<void>;
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
  async getClasses(params?: { date?: string; instructorId?: string; includeUnpublished?: boolean }): Promise<FitnessClass[]> {
    const store = InMemoryClassStore.get();
    return store.classes.filter((c) => {
      if (params?.date && c.date !== params.date) return false;
      if (params?.instructorId && c.instructorId !== params.instructorId) return false;
      if (!params?.includeUnpublished && !c.isPublished) return false;
      return true;
    });
  }

  async getClassById(id: string): Promise<FitnessClass | undefined> {
    return InMemoryClassStore.get().classes.find((c) => c.id === id);
  }

  async createClass(trainerUserId: string, input: CreateClassInput): Promise<FitnessClass> {
    const store = InMemoryClassStore.get();
    const startMinutes = timeToMinutes(input.startTime);
    const endTime = minutesToTime(startMinutes + input.durationMinutes);

    const fitnessClass: FitnessClass = {
      id: randomUUID(),
      title: input.title,
      description: input.description,
      category: input.category,
      intensity: input.intensity,
      durationMinutes: input.durationMinutes,
      startTime: input.startTime,
      endTime,
      date: input.date,
      instructorId: trainerUserId,
      capacity: input.capacity,
      bookedCount: 0,
      waitlistCount: 0,
      waitlistCapacity: input.waitlistCapacity ?? Math.max(2, Math.round(input.capacity * 0.3)),
      status: "available",
      zoneId: input.zoneId,
      isPublished: false, // trainers publish explicitly (task #10: "create ... and publish")
    };

    store.classes.push(fitnessClass);
    return fitnessClass;
  }

  async updateClass(classId: string, trainerUserId: string, input: UpdateClassInput): Promise<FitnessClass> {
    const fitnessClass = this.requireOwnedClass(classId, trainerUserId);

    Object.assign(fitnessClass, {
      title: input.title ?? fitnessClass.title,
      description: input.description ?? fitnessClass.description,
      category: input.category ?? fitnessClass.category,
      intensity: input.intensity ?? fitnessClass.intensity,
      date: input.date ?? fitnessClass.date,
      capacity: input.capacity ?? fitnessClass.capacity,
      zoneId: input.zoneId ?? fitnessClass.zoneId,
      waitlistCapacity: input.waitlistCapacity ?? fitnessClass.waitlistCapacity,
    });

    if (input.startTime || input.durationMinutes) {
      const startTime = input.startTime ?? fitnessClass.startTime;
      const durationMinutes = input.durationMinutes ?? fitnessClass.durationMinutes;
      fitnessClass.startTime = startTime;
      fitnessClass.durationMinutes = durationMinutes;
      fitnessClass.endTime = minutesToTime(timeToMinutes(startTime) + durationMinutes);
    }

    fitnessClass.status = deriveClassStatus(fitnessClass);
    return fitnessClass;
  }

  async publishClass(classId: string, trainerUserId: string): Promise<FitnessClass> {
    const fitnessClass = this.requireOwnedClass(classId, trainerUserId);
    fitnessClass.isPublished = true;
    return fitnessClass;
  }

  async cancelClass(classId: string, trainerUserId: string): Promise<void> {
    const store = InMemoryClassStore.get();
    const fitnessClass = this.requireOwnedClass(classId, trainerUserId);

    // Task #10 "cancel": remove the class and cancel any confirmed/waitlisted
    // bookings against it, rather than leaving orphaned bookings pointing at
    // a class that no longer appears anywhere.
    for (const booking of store.bookings.values()) {
      if (booking.classId === classId && booking.status !== "cancelled") {
        booking.status = "cancelled";
      }
    }
    store.classes = store.classes.filter((c) => c.id !== classId);
  }

  /** Ownership is re-checked here on every mutation — a trainer can only
   *  ever edit/publish/cancel classes where instructorId is their OWN
   *  userId, never the static demo instructors or another trainer's class. */
  private requireOwnedClass(classId: string, trainerUserId: string): FitnessClass {
    const store = InMemoryClassStore.get();
    const fitnessClass = store.classes.find((c) => c.id === classId);
    if (!fitnessClass || fitnessClass.instructorId !== trainerUserId) {
      throw new ClassError("CLASS_NOT_FOUND", "This class could not be found.");
    }
    return fitnessClass;
  }
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
}

function minutesToTime(totalMinutes: number): string {
  const hh = Math.floor(totalMinutes / 60) % 24;
  const mm = totalMinutes % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export type ClassErrorCode = "CLASS_NOT_FOUND";

export class ClassError extends Error {
  code: ClassErrorCode;
  constructor(code: ClassErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "ClassError";
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

    void createNotification(
      input.userId,
      isWaitlist ? "booking_confirmed" : "booking_confirmed",
      isWaitlist ? "You're on the waitlist" : "Booking confirmed",
      isWaitlist ? `You've been added to the waitlist for ${fitnessClass.title}.` : `You're booked for ${fitnessClass.title}.`
    );

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

    if (fitnessClass) {
      void createNotification(
        callerId,
        "booking_cancelled",
        "Booking cancelled",
        `Your booking for ${fitnessClass.title} has been cancelled.`
      );
    }
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

/**
 * Used only by /api/classes/[id]/attendees — returns raw Booking records
 * (not FitnessClass data) for a given class, so the route can resolve each
 * booker's display name via ProfileRepository. Mock-mode only, matching
 * this app's existing booking storage (see RemoteBookingRepository above).
 */
export async function getBookingsForClassAdmin(classId: string): Promise<Booking[]> {
  const store = InMemoryClassStore.get();
  return Array.from(store.bookings.values()).filter((b) => b.classId === classId);
}
