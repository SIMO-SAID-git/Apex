"use client";

import { useEffect, useRef } from "react";
import { getActivityRealtimeAdapter } from "@/lib/supabase/realtime";
import type { ActivityEvent } from "@/types/activity";

export function useActivityRealtime(onEvent: (payload: ActivityEvent) => void) {
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;

  useEffect(() => {
    const adapter = getActivityRealtimeAdapter();
    const unsubscribe = adapter.subscribe((payload) => callbackRef.current(payload));
    return unsubscribe;
  }, []);
}
