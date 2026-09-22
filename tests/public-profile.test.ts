import { describe, it, expect } from "vitest";
import { MockProfileRepository, createMockProfile } from "@/lib/services/profile-service";

describe("getPublicProfile", () => {
  it("never includes email, phone, or userId for a member", async () => {
    const profile = createMockProfile({
      userId: "user-member-1",
      email: "secret@example.com",
      firstName: "Alex",
      lastName: "Rivera",
      role: "member",
    });

    const repo = new MockProfileRepository();
    const publicProfile = await repo.getPublicProfile(profile.username);

    expect(publicProfile).not.toBeNull();
    expect(publicProfile).not.toHaveProperty("email");
    expect(publicProfile).not.toHaveProperty("phone");
    expect(publicProfile).not.toHaveProperty("userId");
    expect(publicProfile?.role).toBe("member");
  });

  it("exposes trainer marketing fields but still no email/phone/userId", async () => {
    const profile = createMockProfile({
      userId: "user-trainer-1",
      email: "trainer-secret@example.com",
      firstName: "Sam",
      lastName: "Okafor",
      role: "trainer",
    });

    const repo = new MockProfileRepository();
    await repo.updateProfile(profile.userId, {
      trainer: { bio: "Strength coach", specialties: ["strength"], hourlyRate: 80 },
    });

    const publicProfile = await repo.getPublicProfile(profile.username);
    expect(publicProfile?.role).toBe("trainer");
    if (publicProfile?.role === "trainer") {
      expect(publicProfile.bio).toBe("Strength coach");
      expect(publicProfile.hourlyRate).toBe(80);
    }
    expect(publicProfile).not.toHaveProperty("email");
    expect(publicProfile).not.toHaveProperty("userId");
  });

  it("returns null for an unknown username", async () => {
    const repo = new MockProfileRepository();
    const result = await repo.getPublicProfile("does-not-exist-at-all");
    expect(result).toBeNull();
  });

  it("username lookup is case-insensitive", async () => {
    const profile = createMockProfile({
      userId: "user-case-1",
      email: "case@example.com",
      firstName: "Casey",
      lastName: "Lee",
      role: "member",
    });

    const repo = new MockProfileRepository();
    const result = await repo.getPublicProfile(profile.username.toUpperCase());
    expect(result?.username).toBe(profile.username);
  });

  it("generates a unique username automatically on profile creation", () => {
    const a = createMockProfile({ userId: "dup-a", email: "a@example.com", firstName: "Sam", lastName: "Okafor", role: "member" });
    const b = createMockProfile({ userId: "dup-b", email: "b@example.com", firstName: "Sam", lastName: "Okafor", role: "member" });
    expect(a.username).not.toBe(b.username);
  });
});
