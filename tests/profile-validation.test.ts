import { describe, it, expect } from "vitest";
import { updateProfileSchema } from "@/lib/validations/profile-schema";

describe("updateProfileSchema", () => {
  it("accepts a partial update", () => {
    expect(updateProfileSchema.safeParse({ displayName: "J. Doe" }).success).toBe(true);
  });

  it("accepts clearing the phone number", () => {
    expect(updateProfileSchema.safeParse({ phone: null }).success).toBe(true);
  });

  it("rejects a phone number with letters", () => {
    expect(updateProfileSchema.safeParse({ phone: "call-me-maybe" }).success).toBe(false);
  });

  it("accepts a valid fitness goal", () => {
    expect(updateProfileSchema.safeParse({ fitnessGoal: "lose-fat" }).success).toBe(true);
  });

  it("rejects an invalid fitness goal", () => {
    expect(updateProfileSchema.safeParse({ fitnessGoal: "get-ripped-fast" }).success).toBe(false);
  });

  it("rejects a first name over the length limit", () => {
    expect(updateProfileSchema.safeParse({ firstName: "a".repeat(100) }).success).toBe(false);
  });
});
