import { addDays, addMinutes, format, nextMonday, startOfWeek } from "date-fns";
import type { GeneratedWorkoutPlan } from "@/types/workout";
import { escapeIcsText } from "@/lib/utils/formatters";

function formatIcsDate(date: Date): string {
  return format(date, "yyyyMMdd'T'HHmmss");
}

function foldLine(line: string): string {
  // RFC 5545 recommends folding lines longer than 75 octets.
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let remaining = line;
  while (remaining.length > 75) {
    chunks.push(remaining.slice(0, 75));
    remaining = " " + remaining.slice(75);
  }
  chunks.push(remaining);
  return chunks.join("\r\n");
}

/**
 * Builds a minimal, RFC 5545-compatible .ics calendar from a generated
 * workout plan. Each planned session becomes a weekly-recurring VEVENT
 * starting from the next occurrence of that weekday.
 */
export function generateWorkoutIcs(plan: GeneratedWorkoutPlan): string {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  const now = new Date();

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Apex Performance Club//Workout Plan//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  for (const session of plan.sessions) {
    const start = addDays(weekStart, session.day - 1);
    const startAt = start < now ? nextMonday(now) : start;
    const end = addMinutes(startAt, session.durationMinutes);

    const summary = escapeIcsText(`${session.focus} — Apex Training`);
    const description = escapeIcsText(
      `${session.focus} session (${session.intensity} intensity, ${session.durationMinutes} min). ` +
        `Part of your generated plan. Calorie and intensity figures are estimates, not medical advice.`
    );

    lines.push(
      "BEGIN:VEVENT",
      `UID:${plan.id}-day-${session.day}@apex-club.example.com`,
      `DTSTAMP:${formatIcsDate(now)}Z`,
      `DTSTART:${formatIcsDate(startAt)}`,
      `DTEND:${formatIcsDate(end)}`,
      `RRULE:FREQ=WEEKLY;COUNT=8`,
      foldLine(`SUMMARY:${summary}`),
      foldLine(`DESCRIPTION:${description}`),
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export interface CalendarSyncAdapter {
  sync(plan: GeneratedWorkoutPlan): Promise<{ downloadUrl?: string }>;
}

/** Default adapter: produces a downloadable .ics with no third-party account. */
export class IcsFileCalendarAdapter implements CalendarSyncAdapter {
  async sync(plan: GeneratedWorkoutPlan): Promise<{ downloadUrl?: string }> {
    const ics = generateWorkoutIcs(plan);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    return { downloadUrl: URL.createObjectURL(blob) };
  }
}

/**
 * Adapter interface for a future account-based integration (Google Calendar,
 * Outlook, etc). Implementing this and swapping it in requires no UI changes.
 */
export class OAuthCalendarAdapter implements CalendarSyncAdapter {
  async sync(): Promise<{ downloadUrl?: string }> {
    throw new Error("OAuthCalendarAdapter is not configured. Implement provider OAuth + event creation here.");
  }
}
