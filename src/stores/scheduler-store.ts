import { create } from "zustand";
import type { ClassCategory, Intensity } from "@/types/class";
import { getCurrentWeek } from "@/lib/utils/dates";

interface SchedulerState {
  selectedDate: string;
  categories: ClassCategory[];
  intensities: Intensity[];
  instructorIds: string[];
  setSelectedDate: (date: string) => void;
  toggleCategory: (category: ClassCategory) => void;
  toggleIntensity: (intensity: Intensity) => void;
  toggleInstructor: (instructorId: string) => void;
  resetFilters: () => void;
  activeFilterCount: () => number;
}

const today = getCurrentWeek().find((d) => d.isToday)?.date ?? getCurrentWeek()[0]!.date;

export const useSchedulerStore = create<SchedulerState>((set, get) => ({
  selectedDate: today,
  categories: [],
  intensities: [],
  instructorIds: [],

  setSelectedDate: (date) => set({ selectedDate: date }),

  toggleCategory: (category) =>
    set((state) => ({
      categories: state.categories.includes(category)
        ? state.categories.filter((c) => c !== category)
        : [...state.categories, category],
    })),

  toggleIntensity: (intensity) =>
    set((state) => ({
      intensities: state.intensities.includes(intensity)
        ? state.intensities.filter((i) => i !== intensity)
        : [...state.intensities, intensity],
    })),

  toggleInstructor: (instructorId) =>
    set((state) => ({
      instructorIds: state.instructorIds.includes(instructorId)
        ? state.instructorIds.filter((i) => i !== instructorId)
        : [...state.instructorIds, instructorId],
    })),

  resetFilters: () => set({ categories: [], intensities: [], instructorIds: [] }),

  activeFilterCount: () => {
    const { categories, intensities, instructorIds } = get();
    return categories.length + intensities.length + instructorIds.length;
  },
}));
