# Data Flow

## Read path (e.g. loading the class schedule)

```
Browser
  │  useClasses(date) — hooks/queries/use-classes.ts
  ▼
Next.js (client fetch)
  │  fetchClasses(date) — lib/api/classes.ts → apiRequest("/api/classes?date=...")
  ▼
API Route — app/api/classes/route.ts
  │  getClassRepository()
  ▼
Repository — lib/services/booking-service.ts
  │  MockClassRepository.getClasses() (mock mode)
  ▼
Mock data — data/mock-classes.ts (in-memory store, capacity is authoritative here)
```

The response flows back up the same chain. `useClasses` caches it under
`queryKeys.classes(date)`; `ClassScheduler` filters the cached array client-side with the
pure `filterClasses()` helper — filtering never triggers a new network request.

## Write path (creating a booking)

```
BookingSheet.handleConfirm()
  │  useCreateBooking() — hooks/mutations/use-create-booking.ts
  ▼
  onMutate: optimistically increments bookedCount in the "classes" query cache
  ▼
createBooking(input) — lib/api/bookings.ts → POST /api/bookings
  ▼
API Route — app/api/bookings/route.ts
  │  1. Zod-validate body against createBookingSchema
  │  2. getBookingRepository()
  ▼
MockBookingRepository.createBooking()
  │  Re-derives status from the SERVER's copy of bookedCount/capacity —
  │  the client's optimistic guess is never trusted for the real decision.
  ▼
Response: { booking, classStatus }
  ▼
  onSettled: invalidateQueries(["classes"]) reconciles the cache with the true server state
  onError: rolls back the optimistic update
```

## Realtime path (occupancy / activity)

```
Browser mounts a component using useOccupancy()
  │
  ├─ Baseline: refetchInterval: 30_000 (polling, matches spec section 8's "mock mode")
  │
  └─ useOccupancyRealtime() subscribes via getOccupancyRealtimeAdapter()
        │
        ├─ Mock mode: MockOccupancyRealtimeAdapter fires a synthetic Occupancy every 30s
        └─ Supabase configured: SupabaseOccupancyRealtimeAdapter subscribes to
           `postgres_changes` on the `occupancy` table
        │
        ▼
     queryClient.setQueryData(["occupancy"], payload)
        │
        ▼
     Every component reading useOccupancy() re-renders with the new value —
     no polling request was needed for that update.
```

## Summary diagram (spec section 37 format)

```
Browser
  ↓
Next.js (App Router: server components for shell/SEO, client components for interactivity)
  ↓
API / Service Layer (app/api/*/route.ts + lib/services/*)
  ↓
Repository (interfaces in lib/services/*, e.g. ClassRepository, BookingRepository)
  ↓
Mock (data/*, in-memory) / Supabase (lib/supabase/*) / External API (future payment/AI provider)
```
