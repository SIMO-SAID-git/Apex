import { describe, it, expect } from "vitest";
import { generateUniqueUsername } from "@/lib/utils/username";

describe("generateUniqueUsername", () => {
  it("slugifies a name to lowercase alphanumerics", () => {
    const username = generateUniqueUsername("Jane Doe", "11111111-1111-1111-1111-111111111111", () => false);
    expect(username).toBe("janedoe");
  });

  it("falls back to 'member' when the base has no alphanumeric characters", () => {
    const username = generateUniqueUsername("!!!", "11111111-1111-1111-1111-111111111111", () => false);
    expect(username).toBe("member");
  });

  it("appends part of the seed id on a collision", () => {
    let calls = 0;
    const isTaken = (candidate: string) => {
      calls += 1;
      return candidate === "janedoe"; // only the first candidate collides
    };
    const username = generateUniqueUsername("Jane Doe", "abcdef00-0000-0000-0000-000000000000", isTaken);
    expect(username).not.toBe("janedoe");
    expect(username.startsWith("janedoe")).toBe(true);
    expect(calls).toBeGreaterThan(1);
  });

  it("eventually terminates even if every short candidate is taken", () => {
    const username = generateUniqueUsername("Jane Doe", "abcdef1234567890abcdef1234567890", () => true);
    expect(username.length).toBeGreaterThan("janedoe".length);
  });
});
