"use client";

import { useEffect, useRef } from "react";
import { getOccupancyRealtimeAdapter } from "@/lib/supabase/realtime";
import type { Occupancy } from "@/types/occupancy";

/**
 * Subscribes to the occupancy realtime adapter for the lifetime of the
 * component and cleans up correctly on unmount. The adapter implementation
 * (mock interval vs Supabase channel) is resolved once, outside of React.
 */
export function useOccupancyRealtime(onUpdate: (payload: Occupancy) => void) {
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;

  useEffect(() => {
    const adapter = getOccupancyRealtimeAdapter();
    const unsubscribe = adapter.subscribe((payload) => callbackRef.current(payload));
    return unsubscribe;
  }, []);
}
