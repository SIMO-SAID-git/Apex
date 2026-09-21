# Apex Performance Club

A production-oriented, full-stack-ready Next.js fitness club platform: live occupancy,
instructor-led class booking, a deterministic workout-plan generator, and an interactive
facility map — all running on mock data out of the box, with clear seams for swapping in
Supabase and a real booking/payment provider.

## Stack

- **Next.js 14** (App Router) + **React 18** + **TypeScript** (strict mode)
- **Tailwind CSS** — dark, glassmorphic design system (see `src/app/globals.css`)
- **Zustand** — client/UI state only (filters, wizard steps, sheet/drawer open state)
- **TanStack Query** — all server state (classes, occupancy, bookings, activity, equipment, session, profile)
- **Framer Motion** — kinetic typography, staggered lists, sheet/drawer/modal transitions
- **Zod** — runtime validation for API routes, the workout wizard, and every auth/profile form
- **date-fns**, **lucide-react**
- **Supabase** (`@supabase/supabase-js` + `@supabase/ssr`) — auth, realtime, and Postgres, cookie-based sessions, unused unless configured
- **Vitest** — unit tests for the algorithmic/business-logic core, including auth validation, error mapping, and booking ownership

## Getting started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. No environment variables or external accounts are required —
the app runs entirely on mock data and in-memory state by default.

## Environment variables

Copy `.env.example` to `.env.local` if you want to override defaults:

```env
NEXT_PUBLIC_USE_MOCK_DATA=true   # false once real repositories/auth are configured
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-only, never sent to the client
NEXT_PUBLIC_SITE_URL=            # used to build email confirmation / OAuth redirect URLs
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=# "true" once Google is enabled in Supabase
PAYMENTS_SECRET_KEY=             # server-only, for a real booking/payment provider
```

With no Supabase variables set, `getOccupancyRealtimeAdapter()`, `getActivityRealtimeAdapter()`,
and `getAuthService()` all automatically fall back to mock/interval-based implementations —
nothing throws, nothing is left half-configured. See [`docs/authentication.md`](docs/authentication.md)
for the full auth setup, including the required SQL migration.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (type-checked) |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run test` | Run the Vitest suite once |
| `npm run test:watch` | Watch mode |

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for the full state-ownership table and
the one intentional structural deviation from the original spec (a routing conflict
between `app/page.tsx` and `app/(marketing)/page.tsx`, resolved by keeping only the
latter — App Router route groups don't add a path segment, so both would otherwise
register the same `/` route).

See [`docs/data-flow.md`](docs/data-flow.md) for the read/write/realtime data-flow
diagrams (`Browser → Next.js → API/Service → Repository → Mock/Supabase/External`).

### State management strategy, short version

- **Server Components**: static marketing copy, per-page metadata.
- **TanStack Query**: anything fetched from `/api/*` — classes, occupancy, instructors,
  equipment, activity feed, a member's bookings, session, and profile. Never duplicated
  into Zustand; session state in particular is kept fresh by push events
  (`lib/auth/auth-events.ts` + Supabase's `onAuthStateChange`) rather than polling.
- **Zustand**: selected day, active filters, booking-sheet state machine, workout-wizard
  step + answers, facility drawer open/selected zone. Never holds server data or session state.

### Authentication

Full customer accounts — registration, email verification, login, password reset,
protected `/dashboard/*` routes, profile management, avatar upload, and account
deletion — run on Supabase Auth, with a mock-mode adapter so the entire flow works
without any credentials. See [`docs/authentication.md`](docs/authentication.md) for the
full architecture, the required SQL migration, RLS policies, and the booking/auth
integration (an unauthenticated "Book" click preserves the selected class through the
login redirect and resumes exactly where the customer left off).

### Mock mode

`NEXT_PUBLIC_USE_MOCK_DATA=true` (the default) routes every repository factory
(`getClassRepository`, `getBookingRepository`, `getOccupancyRepository`,
`getProfileRepository`) and `getAuthService()` to an in-memory/mock implementation.
Booking capacity and booking/profile ownership are enforced server-side against that
store — the client's optimistic UI is always reconciled against the real server response,
and the client never supplies its own user id.

### Supabase integration

`src/lib/supabase/client.ts` (browser, `@supabase/ssr`, anon key only),
`src/lib/supabase/server.ts` (session-aware server client for RLS-scoped queries, plus a
separate service-role client guarded by the `server-only` package), and
`src/lib/supabase/middleware.ts` (session refresh for `middleware.ts`) are ready to use.
To go live:

1. Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and
   `SUPABASE_SERVICE_ROLE_KEY`.
2. Run `supabase/migrations/001_customer_profiles.sql` against your project.
3. Implement `SupabaseOccupancyRepository.getOccupancy()` and
   `RemoteBookingRepository` against your schema.
4. Set `NEXT_PUBLIC_USE_MOCK_DATA=false`.

No component, hook, or page needs to change — they all depend on the repository/service
interfaces, not the mock implementations.

### Realtime architecture

`RealtimeAdapter<T>` (`src/lib/supabase/realtime.ts`) is the single abstraction every
realtime feature depends on. `MockOccupancyRealtimeAdapter` / `MockActivityRealtimeAdapter`
fire synthetic events on an interval; `SupabaseOccupancyRealtimeAdapter` /
`SupabaseActivityRealtimeAdapter` subscribe to Postgres change events on `occupancy` and
`activity_events` tables respectively. Both write into the same TanStack Query cache key,
so UI components can't tell which adapter is active.

### Testing

`npm run test` runs Vitest against the pure, side-effect-free core:

- `tests/workout-service.test.ts` — the deterministic recommendation engine
- `tests/class-filters.test.ts` — scheduler filter predicate logic
- `tests/booking-validation.test.ts`, `tests/booking-auth.test.ts` — Zod schema, booking
  repository invariants (capacity enforcement, duplicate bookings, cancellation freeing a
  spot), and ownership enforcement (a customer can never cancel or read another
  customer's bookings)
- `tests/ics-generator.test.ts` — RFC 5545 structure, escaping, one VEVENT per session
- `tests/occupancy.test.ts`, `tests/class-status.test.ts` — status-derivation logic
- `tests/auth-validation.test.ts` — password policy, register/login/reset Zod schemas
- `tests/auth-errors.test.ts` — provider errors map to stable codes/friendly messages
  without leaking internal details
- `tests/auth-redirects.test.ts` — the post-login redirect can't be turned into an open
  redirect, and a preserved `classId` round-trips correctly
- `tests/profile-validation.test.ts` — profile update schema

### Deployment notes

The app is a standard Next.js 14 App Router project and deploys as-is to Vercel or any
Node hosting that supports Next.js. In mock mode there are no external dependencies to
provision. Once Supabase is wired in, add the environment variables above to your hosting
provider's dashboard — `SUPABASE_SERVICE_ROLE_KEY` and `PAYMENTS_SECRET_KEY` must only be
set as server-side/runtime secrets, never exposed with a `NEXT_PUBLIC_` prefix. Add your
production domain's `/auth/callback` URL to Supabase's allowed redirect URLs before going
live.

### Future integrations

- Replace `RemoteBookingRepository` with a real payment/booking provider (Stripe +
  a scheduling backend, or a gym-management API).
- Replace `generateWorkoutPlan()` with an AI-backed recommendation service — the
  function signature (`WorkoutPreferences → GeneratedWorkoutPlan`) is the contract to
  preserve.
- Implement `OAuthCalendarAdapter` for account-based Google/Outlook calendar sync
  alongside the existing no-account `.ics` download.
- Sync scheduler filters (`categories`, `intensities`, `instructorIds`, `selectedDate`)
  to the URL via `useSearchParams`/`useRouter` for shareable, bookmarkable filtered views.
- Enable Google in Supabase's Auth providers and set `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true`
  to turn on the already-wired "Continue with Google" button (`SupabaseAuthService.signInWithOAuth`
  is implemented; only the provider configuration is missing).
