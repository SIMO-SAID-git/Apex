import { describe, it, expect } from "vitest";
import { generateWorkoutPlan, spreadDaysAcrossWeek } from "@/lib/services/workout-service";

describe("spreadDaysAcrossWeek", () => {
  it("returns exactly N unique days for every valid input", () => {
    for (const days of [2, 3, 4, 5, 6] as const) {
      const result = spreadDaysAcrossWeek(days);
      expect(new Set(result).size).toBe(days);
      expect(result.every((d) => d >= 1 && d <= 7)).toBe(true);
    }
  });
});

describe("generateWorkoutPlan", () => {
  it("produces one session per requested training day", () => {
    const plan = generateWorkoutPlan({ goal: "build-strength", experience: "intermediate", daysPerWeek: 4 });
    expect(plan.sessions).toHaveLength(4);
  });

  it("caps intensity for beginners at medium", () => {
    const plan = generateWorkoutPlan({ goal: "lose-fat", experience: "beginner", daysPerWeek: 5 });
    expect(plan.sessions.every((s) => s.intensity !== "high")).toBe(true);
  });

  it("allows high intensity for advanced athletes", () => {
    const plan = generateWorkoutPlan({ goal: "build-strength", experience: "advanced", daysPerWeek: 6 });
    expect(plan.sessions.some((s) => s.intensity === "high")).toBe(true);
  });

  it("marks the plan as an estimate and never claims medical accuracy", () => {
    const plan = generateWorkoutPlan({ goal: "general-fitness", experience: "intermediate", daysPerWeek: 3 });
    expect(plan.isEstimate).toBe(true);
    expect(plan.estimatedWeeklyCalories).toBeGreaterThan(0);
  });

  it("computes recovery days as the complement of training days", () => {
    const plan = generateWorkoutPlan({ goal: "mobility-recovery", experience: "beginner", daysPerWeek: 3 });
    expect(plan.recoveryDaysPerWeek).toBe(7 - 3);
  });

  it("produces a muscle distribution across all six groups", () => {
    const plan = generateWorkoutPlan({ goal: "general-fitness", experience: "advanced", daysPerWeek: 4 });
    expect(plan.muscleDistribution).toHaveLength(6);
  });
});
