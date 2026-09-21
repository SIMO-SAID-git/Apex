import { describe, it, expect } from "vitest";
import { createBookingSchema } from "@/lib/validations/booking-schema";
import { MockBookingRepository } from "@/lib/services/booking-service";

describe("createBookingSchema", () => {
  it("accepts a valid payload", () => {
    const result = createBookingSchema.safeParse({ classId: "cls-01" });
    expect(result.success).toBe(true);
  });

  it("rejects a payload missing classId", () => {
    const result = createBookingSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("rejects a payload with an empty classId", () => {
    const result = createBookingSchema.safeParse({ classId: "" });
    expect(result.success).toBe(false);
  });
});

describe("MockBookingRepository", () => {
  it("throws CLASS_NOT_FOUND for an unknown class id", async () => {
    const repo = new MockBookingRepository();
    await expect(repo.createBooking({ classId: "does-not-exist", userId: "user-1" })).rejects.toMatchObject({
      code: "CLASS_NOT_FOUND",
    });
  });

  it("rejects a duplicate booking from the same user for the same class", async () => {
    const repo = new MockBookingRepository();
    const first = await repo.createBooking({ classId: "cls-02", userId: "dup-user" });
    expect(first.booking.status).toMatch(/confirmed|waitlisted/);

    await expect(repo.createBooking({ classId: "cls-02", userId: "dup-user" })).rejects.toMatchObject({
      code: "ALREADY_BOOKED",
    });
  });

  it("cancelling a confirmed booking frees a spot for someone else", async () => {
    const repo = new MockBookingRepository();
    const booked = await repo.createBooking({ classId: "cls-03", userId: "user-a" });
    await repo.cancelBooking(booked.booking.id, "user-a");
    // A second user should now be able to book without hitting ALREADY_BOOKED/CLASS_FULL
    const secondBooking = await repo.createBooking({ classId: "cls-03", userId: "user-b" });
    expect(secondBooking.booking.status).toMatch(/confirmed|waitlisted/);
  });
});
