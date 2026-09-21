"use client";

import type { Occupancy } from "@/types/occupancy";
import type { ActivityEvent } from "@/types/activity";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { nextMockActivityEvent } from "@/data/mock-activity";
import { buildMockOccupancy } from "@/data/mock-occupancy";

/**
 * A realtime source the UI never needs to know the identity of — it could be
 * polling, a raw WebSocket, or Supabase Realtime. Every adapter exposes the
 * same `subscribe` shape and returns an unsubscribe function.
 */
export interface RealtimeAdapter<T> {
  subscribe(onEvent: (payload: T) => void): () => void;
}

export class MockOccupancyRealtimeAdapter implements RealtimeAdapter<Occupancy> {
  subscribe(onEvent: (payload: Occupancy) => void): () => void {
    const interval = setInterval(() => {
      onEvent(buildMockOccupancy(Date.now()));
    }, 30_000);
    return () => clearInterval(interval);
  }
}

export class MockActivityRealtimeAdapter implements RealtimeAdapter<ActivityEvent> {
  subscribe(onEvent: (payload: ActivityEvent) => void): () => void {
    const interval = setInterval(() => {
      onEvent(nextMockActivityEvent());
    }, 15_000);
    return () => clearInterval(interval);
  }
}

/**
 * Production adapter: subscribes to a Postgres changes channel via Supabase
 * Realtime. Falls back to a no-op subscription if Supabase isn't configured,
 * so the app degrades gracefully rather than throwing.
 */
export class SupabaseOccupancyRealtimeAdapter implements RealtimeAdapter<Occupancy> {
  subscribe(onEvent: (payload: Occupancy) => void): () => void {
    const client = getSupabaseBrowserClient();
    if (!client) return () => {};

    const channel = client
      .channel("occupancy-updates")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "occupancy" },
        (payload) => {
          const row = payload.new as Occupancy;
          if (row && typeof row.percentage === "number") {
            onEvent(row);
          }
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }
}

export class SupabaseActivityRealtimeAdapter implements RealtimeAdapter<ActivityEvent> {
  subscribe(onEvent: (payload: ActivityEvent) => void): () => void {
    const client = getSupabaseBrowserClient();
    if (!client) return () => {};

    const channel = client
      .channel("activity-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_events" },
        (payload) => {
          onEvent(payload.new as ActivityEvent);
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }
}

export function getOccupancyRealtimeAdapter(): RealtimeAdapter<Occupancy> {
  const client = getSupabaseBrowserClient();
  return client ? new SupabaseOccupancyRealtimeAdapter() : new MockOccupancyRealtimeAdapter();
}

export function getActivityRealtimeAdapter(): RealtimeAdapter<ActivityEvent> {
  const client = getSupabaseBrowserClient();
  return client ? new SupabaseActivityRealtimeAdapter() : new MockActivityRealtimeAdapter();
}
