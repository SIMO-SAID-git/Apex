import type { ActivityEvent } from "@/types/activity";

const names = [
  "Sarah M.", "David K.", "Lena P.", "Marcus T.", "Priya R.", "Omar F.",
  "Ines V.", "Tom H.", "Ayesha N.", "Carlos D.", "Grace L.", "Ben O.",
];

const bookingMessages = [
  "just booked 18:00 Boxing",
  "just booked 06:00 Foundations Barbell",
  "just booked 17:30 Functional HIIT",
  "just booked 19:30 Evening Flow",
  "just booked 07:00 Metcon Sprint",
  "just booked 09:00 Weekend Warm-Up",
];

const milestoneMessages = [
  "hit a 5-day check-in streak",
  "completed their 50th class",
  "set a new personal best on deadlift",
  "finished their first Metcon Sprint",
];

const checkinMessages = [
  "checked in to the Heavy Iron Pit",
  "checked in to the Cardio Deck",
  "checked in to the Recovery Zone",
];

function buildEvent(id: number, name: string, message: string, type: ActivityEvent["type"], minutesAgo: number): ActivityEvent {
  return {
    id: `act-${id}`,
    type,
    message: `${name} ${message}`,
    memberInitial: name[0] ?? "M",
    timestamp: new Date(Date.now() - minutesAgo * 60_000).toISOString(),
  };
}

export const mockActivityEvents: ActivityEvent[] = [
  buildEvent(1, names[0]!, bookingMessages[0]!, "booking", 1),
  buildEvent(2, names[1]!, milestoneMessages[0]!, "milestone", 4),
  buildEvent(3, names[2]!, bookingMessages[1]!, "booking", 7),
  buildEvent(4, names[3]!, checkinMessages[0]!, "checkin", 9),
  buildEvent(5, names[4]!, bookingMessages[2]!, "booking", 12),
  buildEvent(6, names[5]!, milestoneMessages[1]!, "milestone", 15),
  buildEvent(7, names[6]!, bookingMessages[3]!, "booking", 18),
  buildEvent(8, names[7]!, checkinMessages[1]!, "checkin", 21),
  buildEvent(9, names[8]!, bookingMessages[4]!, "booking", 24),
  buildEvent(10, names[9]!, milestoneMessages[2]!, "milestone", 27),
  buildEvent(11, names[10]!, bookingMessages[5]!, "booking", 30),
  buildEvent(12, names[11]!, checkinMessages[2]!, "checkin", 33),
];

let cursor = 0;

/** Cycles through mock events, used by the mock realtime adapter and API route. */
export function nextMockActivityEvent(): ActivityEvent {
  const base = mockActivityEvents[cursor % mockActivityEvents.length]!;
  cursor += 1;
  return { ...base, id: `act-live-${Date.now()}-${cursor}`, timestamp: new Date().toISOString() };
}
