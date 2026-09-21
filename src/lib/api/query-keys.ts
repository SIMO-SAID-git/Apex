export const queryKeys = {
  classes: (date?: string) => ["classes", date ?? "all"] as const,
  occupancy: () => ["occupancy"] as const,
  activity: () => ["activity"] as const,
  instructors: () => ["instructors"] as const,
  equipment: () => ["equipment"] as const,
};
