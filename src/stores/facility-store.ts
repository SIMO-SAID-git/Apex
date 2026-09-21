import { create } from "zustand";

interface FacilityState {
  selectedZoneId: string | null;
  drawerOpen: boolean;
  selectZone: (zoneId: string) => void;
  closeDrawer: () => void;
}

export const useFacilityStore = create<FacilityState>((set) => ({
  selectedZoneId: null,
  drawerOpen: false,

  selectZone: (zoneId) => set({ selectedZoneId: zoneId, drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
}));
