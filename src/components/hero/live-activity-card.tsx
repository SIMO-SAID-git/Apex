"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity } from "lucide-react";
import { useActivityFeed } from "@/hooks/queries/use-activity-feed";
import type { ActivityEvent } from "@/types/activity";

const VISIBLE_DURATION_MS = 5000;

/**
 * Shows one activity event at a time, cycling through the feed. Uses a
 * single polite live region so screen readers announce updates without
 * interrupting the user on every event.
 */
export function LiveActivityCard() {
  const { data: events } = useActivityFeed();
  const [visibleEvent, setVisibleEvent] = useState<ActivityEvent | null>(null);
  const [cursor, setCursor] = useState(0);

  useEffect(() => {
    if (!events || events.length === 0) return;

    setVisibleEvent(events[cursor % events.length] ?? null);

    const showTimer = setTimeout(() => setVisibleEvent(null), VISIBLE_DURATION_MS - 400);
    const advanceTimer = setTimeout(() => setCursor((c) => c + 1), VISIBLE_DURATION_MS);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(advanceTimer);
    };
  }, [events, cursor]);

  return (
    <div className="hidden sm:block">
      <div className="sr-only" aria-live="polite">
        {visibleEvent?.message ?? ""}
      </div>
      <AnimatePresence mode="wait">
        {visibleEvent ? (
          <motion.div
            key={visibleEvent.id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            aria-hidden
            className="glass-strong rounded-2xl px-4 py-3 flex items-center gap-3 max-w-xs"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Activity className="h-4 w-4" />
            </div>
            <p className="text-sm text-white/85 leading-snug">{visibleEvent.message}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
