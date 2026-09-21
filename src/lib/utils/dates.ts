import { addDays, format, isSameDay, parseISO, startOfWeek } from "date-fns";

export const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type DayKey = (typeof DAY_KEYS)[number];

export interface WeekDay {
  key: DayKey;
  date: string; // yyyy-MM-dd
  label: string; // "Mon"
  dayNumber: string; // "14"
  isToday: boolean;
}

export function getCurrentWeek(referenceDate: Date = new Date()): WeekDay[] {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const today = new Date();

  return DAY_KEYS.map((key, index) => {
    const date = addDays(start, index);
    return {
      key,
      date: format(date, "yyyy-MM-dd"),
      label: format(date, "EEE"),
      dayNumber: format(date, "d"),
      isToday: isSameDay(date, today),
    };
  });
}

export function dayKeyForDate(dateIso: string): DayKey {
  const date = parseISO(dateIso);
  const dow = date.getDay(); // 0 = Sunday
  const mondayIndexed = dow === 0 ? 6 : dow - 1;
  const key = DAY_KEYS[mondayIndexed];
  if (!key) {
    throw new Error(`Unable to resolve day key for date ${dateIso}`);
  }
  return key;
}

export function formatTimeRange(start: string, end: string): string {
  return `${start} – ${end}`;
}

export function formatFriendlyDate(dateIso: string): string {
  return format(parseISO(dateIso), "EEEE, MMMM d");
}
