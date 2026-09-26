import { describe, it, expect } from "vitest";
import { isTrainer, hasFullAccess, canBookAsAttendee, canViewAttendeeRoster, isElite } from "@/lib/auth/permissions";
import type { CustomerProfile } from "@/types/profile";

function makeProfile(overrides: Partial<CustomerProfile>): CustomerProfile {
  return {
    id: "p1",
    userId: "u1",
    username: "test",
    role: "member",
    firstName: "Test",
    lastName: "User",
    displayName: "Test User",
    email: "test@example.com",
    avatarUrl: null,
    phone: null,
    bio: null,
    fitnessGoal: null,
    languagePreference: "en",
    membershipTier: "free",
    trainer: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("permissions", () => {
  it("a signed-out visitor (null profile) has no access", () => {
    expect(hasFullAccess(null)).toBe(false);
    expect(canBookAsAttendee(null)).toBe(false);
    expect(canViewAttendeeRoster(null)).toBe(false);
  });

  it("a free member cannot book or view rosters", () => {
    const profile = makeProfile({ membershipTier: "free" });
    expect(canBookAsAttendee(profile)).toBe(false);
    expect(canViewAttendeeRoster(profile)).toBe(false);
    expect(hasFullAccess(profile)).toBe(false);
  });

  it("a foundation member can book and view rosters", () => {
    const profile = makeProfile({ membershipTier: "foundation" });
    expect(canBookAsAttendee(profile)).toBe(true);
    expect(canViewAttendeeRoster(profile)).toBe(true);
  });

  it("a trainer has full access but can never book as an attendee", () => {
    const profile = makeProfile({ role: "trainer", membershipTier: "free" });
    expect(isTrainer(profile)).toBe(true);
    expect(hasFullAccess(profile)).toBe(true);
    expect(canViewAttendeeRoster(profile)).toBe(true);
    expect(canBookAsAttendee(profile)).toBe(false);
  });

  it("only a non-trainer elite member counts as elite", () => {
    expect(isElite(makeProfile({ membershipTier: "elite" }))).toBe(true);
    expect(isElite(makeProfile({ role: "trainer", membershipTier: "elite" }))).toBe(false);
    expect(isElite(makeProfile({ membershipTier: "performance" }))).toBe(false);
  });
});
