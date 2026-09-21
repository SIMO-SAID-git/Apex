import { describe, it, expect } from "vitest";
import { createBookingSchema } from "@/lib/validations/booking-schema";
import { MockBookingRepository, BookingError } from "@/lib/services/booking-service";

describe("createBookingSchema (client-facing)", () => {
  it("no longer accepts or requires a client-supplied userId", () => {
    // The schema's shape is the API's contract with the browser: identity
    // must come from the server session, never from the request body.
    const result = createBookingSchema.safeParse({ classId: "cls-01" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect("userId" in result.data).toBe(false);
    }
  });

  it("still requires classId", () => {
    expect(createBookingSchema.safeParse({}).success).toBe(false);
  });
});

describe("booking ownership enforcement", () => {
  it("a customer cannot cancel another customer's booking", async () => {
    const repo = new MockBookingRepository();
    const owner = await repo.createBooking({ classId: "cls-04", userId: "owner-user" });

    await expect(repo.cancelBooking(owner.booking.id, "someone-else")).rejects.toBeInstanceOf(BookingError);
  });

  it("the actual owner can cancel their own booking", async () => {
    const repo = new MockBookingRepository();
    const owner = await repo.createBooking({ classId: "cls-05", userId: "owner-user-2" });

    await expect(repo.cancelBooking(owner.booking.id, "owner-user-2")).resolves.toBeUndefined();
  });

  it("getBookingsForUser only returns the requested user's bookings", async () => {
    const repo = new MockBookingRepository();
    await repo.createBooking({ classId: "cls-06", userId: "user-a" });
    await repo.createBooking({ classId: "cls-07", userId: "user-b" });

    const aBookings = await repo.getBookingsForUser("user-a");
    expect(aBookings.every((b) => b.userId === "user-a")).toBe(true);
    expect(aBookings.some((b) => b.classId === "cls-07")).toBe(false);
  });
});
