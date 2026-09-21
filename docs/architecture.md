# Architecture

## Structural deviation from the original spec

The spec's file tree lists both `src/app/page.tsx` and `src/app/(marketing)/page.tsx`.
In the Next.js App Router, route groups (`(marketing)`) do not add a path segment, so
`(marketing)/page.tsx` already resolves to `/`. Shipping both files would register two
handlers for the same route and fail to build. This implementation keeps
`(marketing)/page.tsx` as the home page and omits a top-level `app/page.tsx`. Everything
else follows the requested structure as specified.

## State ownership

| Layer | Owns | Examples |
|---|---|---|
| **Server Components** | Static/SEO content, metadata, layout shells | Marketing page copy, `<head>` metadata, page-level `generateMetadata` |
| **TanStack Query** | Any data that originates on the server and can go stale | classes, occupancy, instructors, equipment, activity feed, a user's bookings |
| **Zustand** | Ephemeral client/UI state with no server source of truth | selected day, active filters, booking sheet open/closed + step, workout wizard step + in-progress answers, facility drawer open/closed |
| **URL state** | Nothing is currently mirrored to the URL in this build, but `selectedDate`/filters in `scheduler-store` are structured as flat primitives specifically so a future `useSearchParams` sync (e.g. `/classes?day=wed&category=hiit`) can be added without restructuring the store. |

**Rule enforced throughout:** server state is never duplicated into a Zustand store, and
Zustand never holds data that a `useQuery` call already owns. Components read query data
directly; stores only hold selection/UI state that references that data by id (e.g.
`selectedClass: FitnessClass | null` in `booking-store`, populated from a query result).

## How realtime updates propagate

```
RealtimeAdapter.subscribe(callback)
        │
        ▼
Mock: setInterval → synthetic payload         Supabase: postgres_changes channel → row payload
        │                                              │
        └──────────────────┬───────────────────────────┘
                            ▼
              hooks/realtime/use-*-realtime.ts
                            │
                            ▼
              queryClient.setQueryData(queryKey, payload)
                            │
                            ▼
                 Any component using useOccupancy()/
                 useActivityFeed() re-renders automatically
```

Components never talk to the adapter directly. `useOccupancy()` and `useActivityFeed()`
each call their matching `use-*-realtime` hook internally and write into the TanStack
Query cache via `queryClient.setQueryData`. This means:

- The UI has exactly one code path for "occupancy changed", regardless of whether the
  change came from the 30s poll or a push event.
- Swapping `MockOccupancyRealtimeAdapter` for `SupabaseOccupancyRealtimeAdapter` (done
  automatically in `getOccupancyRealtimeAdapter()` once Supabase env vars are present)
  requires zero changes to components or hooks.

## How mock services become production services

Every external dependency is behind an interface with a `Mock*` implementation and a
factory function that switches on `isMockMode` (`NEXT_PUBLIC_USE_MOCK_DATA`):

| Interface | Mock implementation | Production implementation (to write) | Factory |
|---|---|---|---|
| `ClassRepository` | `MockClassRepository` (in-memory) | A real DB/Supabase-backed repository | `getClassRepository()` |
| `BookingRepository` | `MockBookingRepository` (in-memory, capacity-checked) | `RemoteBookingRepository` (stubbed, throws until implemented) | `getBookingRepository()` |
| `OccupancyRepository` | `MockOccupancyRepository` | `SupabaseOccupancyRepository` (stubbed) | `getOccupancyRepository()` |
| `RealtimeAdapter<T>` | `MockOccupancyRealtimeAdapter` / `MockActivityRealtimeAdapter` | `SupabaseOccupancyRealtimeAdapter` / `SupabaseActivityRealtimeAdapter` (implemented, activates automatically once Supabase env vars are set) | `getOccupancyRealtimeAdapter()` / `getActivityRealtimeAdapter()` |
| `CalendarSyncAdapter` | `IcsFileCalendarAdapter` (no account needed) | `OAuthCalendarAdapter` (stubbed) | manual choice in the component |
| Workout recommendation | `generateWorkoutPlan()` (deterministic, rule-based) | Any AI/API-backed function with the same signature | Direct swap in `frequency-selection.tsx` |

None of these swaps touch a component, a hook's public signature, or a page. The
dependency direction is always `components → hooks → lib/api or lib/services →
repository interface → mock or real implementation`.

## Rendering strategy

- Marketing pages (`(marketing)/*`) are server components by default, statically
  rendered where nothing depends on request-time data, with per-page `metadata` exports
  for SEO.
- Dashboard pages render a server shell (`page.tsx`) but delegate all interactive data
  fetching to client components (`ClassScheduler`, `WorkoutGenerator`, `FacilityMap`,
  `BookingsList`) marked `"use client"`, so only the interactive islands ship
  client-side JS for data fetching.
- Dashboard routes are excluded from indexing via `robots: { index: false }` in their
  metadata and via `disallow: ["/dashboard"]` in `app/robots.ts`.
