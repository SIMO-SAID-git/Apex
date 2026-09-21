import { create } from "zustand";
import type {
  DaysPerWeek,
  ExperienceLevel,
  GeneratedWorkoutPlan,
  WorkoutGoal,
} from "@/types/workout";

export type WorkoutWizardStep = "goal" | "experience" | "frequency" | "result";

interface WorkoutState {
  step: WorkoutWizardStep;
  goal: WorkoutGoal | null;
  experience: ExperienceLevel | null;
  daysPerWeek: DaysPerWeek | null;
  plan: GeneratedWorkoutPlan | null;
  setGoal: (goal: WorkoutGoal) => void;
  setExperience: (experience: ExperienceLevel) => void;
  setDaysPerWeek: (days: DaysPerWeek) => void;
  setPlan: (plan: GeneratedWorkoutPlan) => void;
  goToStep: (step: WorkoutWizardStep) => void;
  reset: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  step: "goal",
  goal: null,
  experience: null,
  daysPerWeek: null,
  plan: null,

  setGoal: (goal) => set({ goal, step: "experience" }),
  setExperience: (experience) => set({ experience, step: "frequency" }),
  setDaysPerWeek: (daysPerWeek) => set({ daysPerWeek }),
  setPlan: (plan) => set({ plan, step: "result" }),
  goToStep: (step) => set({ step }),

  reset: () => set({ step: "goal", goal: null, experience: null, daysPerWeek: null, plan: null }),
}));
