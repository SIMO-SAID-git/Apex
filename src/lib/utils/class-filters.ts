import type { ClassCategory, FitnessClass, Intensity } from "@/types/class";

export interface ClassFilterState {
  categories: ClassCategory[];
  intensities: Intensity[];
  instructorIds: string[];
}

/**
 * Pure predicate used by the scheduler to filter classes. Extracted from the
 * component so it can be unit tested without rendering React.
 */
export function matchesClassFilters(fitnessClass: FitnessClass, filters: ClassFilterState): boolean {
  if (filters.categories.length > 0 && !filters.categories.includes(fitnessClass.category)) {
    return false;
  }
  if (filters.intensities.length > 0 && !filters.intensities.includes(fitnessClass.intensity)) {
    return false;
  }
  if (filters.instructorIds.length > 0 && !filters.instructorIds.includes(fitnessClass.instructorId)) {
    return false;
  }
  return true;
}

export function filterClasses(classes: FitnessClass[], filters: ClassFilterState): FitnessClass[] {
  return classes.filter((c) => matchesClassFilters(c, filters));
}
