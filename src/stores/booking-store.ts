import { create } from "zustand";
import type { FitnessClass } from "@/types/class";

type BookingSheetState = "closed" | "reviewing" | "pending" | "success" | "error";

interface BookingState {
  selectedClass: FitnessClass | null;
  sheetState: BookingSheetState;
  errorMessage: string | null;
  openBookingSheet: (fitnessClass: FitnessClass) => void;
  closeBookingSheet: () => void;
  setSheetState: (state: BookingSheetState) => void;
  setError: (message: string | null) => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedClass: null,
  sheetState: "closed",
  errorMessage: null,

  openBookingSheet: (fitnessClass) =>
    set({ selectedClass: fitnessClass, sheetState: "reviewing", errorMessage: null }),

  closeBookingSheet: () => set({ selectedClass: null, sheetState: "closed", errorMessage: null }),

  setSheetState: (state) => set({ sheetState: state }),

  setError: (message) => set({ errorMessage: message, sheetState: message ? "error" : "reviewing" }),
}));
