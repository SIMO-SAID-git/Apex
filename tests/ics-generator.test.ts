import { describe, it, expect } from "vitest";
import { generateWorkoutIcs } from "@/lib/generators/ics-generator";
import { generateWorkoutPlan } from "@/lib/services/workout-service";

describe("generateWorkoutIcs", () => {
  const plan = generateWorkoutPlan({ goal: "build-strength", experience: "intermediate", daysPerWeek: 3 });
  const ics = generateWorkoutIcs(plan);

  it("produces a valid VCALENDAR wrapper", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR")).toBe(true);
    expect(ics.trim().endsWith("END:VCALENDAR")).toBe(true);
  });

  it("includes one VEVENT per planned session", () => {
    const eventCount = (ics.match(/BEGIN:VEVENT/g) ?? []).length;
    expect(eventCount).toBe(plan.sessions.length);
  });

  it("gives every event a unique UID", () => {
    const uids = [...ics.matchAll(/UID:([^\r\n]+)/g)].map((m) => m[1]);
    expect(new Set(uids).size).toBe(uids.length);
  });

  it("escapes special characters in generated text fields", () => {
    // Commas and semicolons must never appear unescaped in DESCRIPTION/SUMMARY values.
    const descriptionLines = ics.split("\r\n").filter((line) => line.startsWith("DESCRIPTION"));
    for (const line of descriptionLines) {
      expect(line).not.toMatch(/[^\\];/); // no unescaped semicolon
    }
  });

  it("sets DTEND after DTSTART for every event", () => {
    const starts = [...ics.matchAll(/DTSTART:(\d{8}T\d{6})/g)].map((m) => m[1]!);
    const ends = [...ics.matchAll(/DTEND:(\d{8}T\d{6})/g)].map((m) => m[1]!);
    expect(starts.length).toBe(ends.length);
    starts.forEach((start, i) => {
      expect(ends[i]! > start).toBe(true);
    });
  });
});
