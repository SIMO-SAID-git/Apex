# Authentication

## Architecture

Authentication is layered exactly like every other feature in this codebase — UI never
talks to Supabase (or the mock provider) directly:

```
Browser (client components)          Server (Server Components, Route Handlers)
        │                                        │
   Auth hooks                          Server Auth Helper
 (hooks/auth/*.ts)                   (lib/auth/session.ts)
        │                                        │
   Auth Service                        Supabase Server Client /
(lib/auth/auth-service.ts)              Mock session cookie
        │                                        │
Supabase Browser Client  /             Supabase Auth / Mock store
   Mock fetch calls
```

Both the browser and server sides ultimately resolve to one of two providers, selected
by the exact same `isMockMode` flag (`NEXT_PUBLIC_USE_MOCK_DATA`) the rest of the app
already uses for classes/occupancy/bookings:

| Concern | Interface | Mock implementation | Production implementation |
|---|---|---|---|
| Sign up / in / out, password reset, OAuth | `AuthService` (`lib/auth/auth-service.ts`) | `MockAuthService` → `/api/auth/mock/*` route handlers | `SupabaseAuthService` → `@supabase/ssr` browser client |
| "Who is logged in" (server-side) | `getServerAuthUser()` (`lib/auth/session.ts`) | reads the `apex_mock_session` cookie | reads the Supabase session cookie via `getSupabaseServerClient()` |
| Customer profile | `ProfileRepository` (`lib/services/profile-service.ts`) | `MockProfileRepository` (in-memory) | `SupabaseProfileRepository` (`profiles` table, RLS-scoped) |

No component or hook imports `@supabase/supabase-js` or fetches `/api/auth/mock/*`
directly — they only ever call `getAuthService()`, `useAuth()`, `useSession()`,
`useProfile()`, or `useAuthActions()`. Swapping providers, or adding a new one, never
touches a component.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/migrations/001_customer_profiles.sql` against it (via the SQL editor,
   or the Supabase CLI: `supabase db push`). This creates:
   - the `profiles` table with RLS enabled and policies scoped to `auth.uid()`
   - a trigger that auto-creates a profile row whenever a new `auth.users` row appears
   - an `avatars` storage bucket with per-customer-folder RLS policies
3. In **Authentication → Providers**, confirm Email is enabled. Optionally enable Google
   and set `NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=true` once it is (see below).
4. In **Authentication → URL Configuration**, add your site's `/auth/callback` route
   (e.g. `https://yourapp.com/auth/callback`) to the allowed redirect URLs.
5. Copy the project URL and anon key into your environment (see below).

## Environment variables

```env
NEXT_PUBLIC_USE_MOCK_DATA=true        # false to use real Supabase Auth
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=            # server-only — account deletion
NEXT_PUBLIC_SITE_URL=                 # used to build email confirmation / OAuth redirect URLs
NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED=     # "true" once Google is configured in Supabase; the
                                       # "Continue with Google" button stays disabled until then
```

`SUPABASE_SERVICE_ROLE_KEY` is read in exactly one place —
`getSupabaseServiceRoleClient()` in `lib/supabase/server.ts`, guarded by the
`server-only` package — and is used only by `/api/account`'s `DELETE` handler to remove
the underlying auth user. It is never sent to the browser.

## Registration flow

```
Register Form (Zod: registerSchema)
  ↓
useAuthActions().signUp()
  ↓
AuthService.signUp() — Supabase: supabase.auth.signUp({ email, password, options: { data } })
                        Mock:     POST /api/auth/mock/register (re-validates with registerServerSchema)
  ↓
Profile creation — Supabase: `handle_new_user()` Postgres trigger (fires on the auth.users insert)
                    Mock:     createMockProfile() called inline by the mock route
  ↓
Verification email — Supabase: sent automatically by supabase.auth.signUp
                       Mock:     simulated — /verify-email's "resend" button marks the account verified
  ↓
/verify-email screen
  ↓
Customer clicks the email link → /auth/callback exchanges the code for a session → /dashboard
  (mock mode: customer clicks "resend" once, is marked verified, then logs in normally)
```

Server-side re-validation: every mock route re-parses the request body with Zod
(`registerServerSchema`, which excludes `confirmPassword`/`acceptedTerms` — pure
client-side UX concerns) before touching the mock user store. In production, Supabase
itself enforces password policy server-side.

## Login flow

```
Login Form (Zod: loginSchema)
  ↓
useAuthActions().signIn()
  ↓
AuthService.signIn() — Supabase: supabase.auth.signInWithPassword(); @supabase/ssr writes
                                  the session into httpOnly cookies automatically
                        Mock:     POST /api/auth/mock/login sets the apex_mock_session cookie
  ↓
authEvents.emit() → every mounted useSession() invalidates and refetches
  ↓
router.push(sanitizeRedirectTarget(redirect)) → back to /dashboard or wherever
  the customer was headed (see "Booking integration" below)
```

`invalid credentials` and `unverified email` are distinguished by error code
(`INVALID_CREDENTIALS` vs `EMAIL_NOT_VERIFIED`) so the UI can link straight to
`/verify-email`, but a wrong password and a nonexistent email produce the *same*
`INVALID_CREDENTIALS` response — this is what stops the login form itself from being
used to enumerate registered addresses.

## Session handling

Session state is never duplicated into Zustand. `useSession()` (`hooks/auth/use-session.ts`)
is the single source of truth on the client: a TanStack Query with `staleTime: Infinity`,
kept fresh by push notifications rather than polling —

- a local pub/sub (`lib/auth/auth-events.ts`) that every sign-in/up/out call emits on, and
- in production, Supabase's own `onAuthStateChange` listener (covers token refresh,
  cross-tab sign-out, etc.)

Server-side, sessions live in httpOnly cookies managed by `@supabase/ssr` (production) or
the `apex_mock_session` cookie (mock mode) — never in `localStorage`/`sessionStorage`.
`middleware.ts` runs on every request to `/dashboard/*` and, in production, calls
`supabase.auth.getUser()` via `lib/supabase/middleware.ts`'s `refreshSupabaseSession()`,
which transparently rotates the access token and re-sets the cookie before the page
renders — this is what makes a reload or a new tab "just work" without a visible
re-login.

## Middleware / route protection

`src/middleware.ts` matches only `/dashboard/:path*` (see its `config.matcher`). Every
other route — `/`, `/classes`, `/facilities`, `/membership`, `/login`, `/register`,
`/forgot-password`, `/reset-password`, `/verify-email` — never reaches the middleware at
all, so there's no risk of accidentally locking out a public page. An unauthenticated
request to a protected path is redirected to `/login?redirect=<original path+query>`;
`login-form.tsx` reads that `redirect` param and sends the customer back after a
successful sign-in.

## Row Level Security

`profiles` has RLS enabled with exactly two policies, both scoped to `auth.uid() = user_id`:
one for `select`, one for `update`. There is no `insert` or `delete` policy for ordinary
customers — rows are created only by the `handle_new_user()` trigger (`security definer`)
and removed only via `on delete cascade` when the auth user itself is deleted. No policy
anywhere uses `using (true)`. The `avatars` storage bucket mirrors the same pattern:
public read (avatars are meant to be visible), but insert/update/delete are restricted to
the folder matching the caller's own `auth.uid()`.

## Profile architecture

The Supabase Auth user and the application's `CustomerProfile` are deliberately separate
concepts (see `types/auth.ts` vs `types/profile.ts`) — auth identity (email, password,
verification status) lives with the provider; everything the app actually displays
(name, avatar, phone, fitness goal) lives in `profiles`, fetched through
`ProfileRepository` exactly like classes go through `ClassRepository`.

## Password recovery

```
/forgot-password → resetPassword(email)
  Supabase: supabase.auth.resetPasswordForEmail(email, { redirectTo: /auth/callback?next=/reset-password })
  Mock:     POST /api/auth/mock/reset-password (always returns { success: true })
  ↓
Generic confirmation message shown regardless of whether the email is registered
  ↓
Customer clicks the emailed link → /auth/callback exchanges the code for a short-lived
  session → redirected to /reset-password
  ↓
/reset-password calls updatePassword(password) against that session
  ↓
Redirected to /login
```

## Account deletion

`DELETE /api/account` is the only code path that touches the service-role client. It:

1. Re-derives the caller's identity from their session (never a client-supplied id).
2. Cancels every active booking the customer holds (same `cancelBooking` code path as a
   normal cancellation, so a spot frees up immediately for someone else).
3. Deletes the `profiles` row (belt-and-suspenders — production also cascades this via
   the FK once the auth user is removed).
4. Mock mode: deletes the mock user and clears the session cookie. Production: calls
   `supabase.auth.admin.deleteUser(userId)` via the service-role client.

No booking history or other customer data is retained after this — there is no separate
anonymization step because this application keeps no other customer-linked data.

## Mock authentication (development mode)

With `NEXT_PUBLIC_USE_MOCK_DATA=true` (the default), `getAuthService()` returns
`MockAuthService`, which talks to `/api/auth/mock/*` route handlers backed by an
in-memory user store (`lib/auth/mock-auth-store.ts`) and a **deliberately unsigned**
base64 session cookie (`lib/auth/mock-session.ts`) — explicitly documented in that file
as dev-only and never usable as a template for production session handling. It exists so
every acceptance-criteria flow (register → verify → login → protected dashboard → booking
→ settings → delete account) can be exercised end to end with zero external
configuration. `getAuthService()` is the *only* place Mock vs Supabase is decided, and it
switches purely on `NEXT_PUBLIC_USE_MOCK_DATA` — there's no code path where mock auth can
accidentally activate in a deployment that has that flag set to `"false"`.

## Booking / authentication integration

```
Customer clicks "Book" on a class (class-slot.tsx)
  ├─ Authenticated → openBookingSheet(fitnessClass) directly
  └─ Not authenticated → router.push("/login?redirect=<page>&classId=<id>")
                                │
                          Customer signs in or registers
                                │
                 signIn() redirects to `redirect` (with classId re-appended)
                                │
              class-scheduler.tsx sees `?classId=` on mount, resolves it
              against the full class list (even if it's on a different day
              than the default selection), calls setSelectedDate + openBookingSheet,
              then strips the param from the URL
                                │
                       Booking sheet opens exactly where the customer left off
```

Server-side, `POST /api/bookings` and `DELETE /api/bookings/:id` both call
`getServerAuthUser()` and 401 if there's no session — the request body never contains a
`userId` (the schema doesn't even accept one), and `cancelBooking(bookingId, callerId)`
checks `booking.userId === callerId` before allowing a cancellation, returning the same
"not found" response whether the booking doesn't exist or simply isn't the caller's own.

## Testing

`npm run test` covers, among the pre-existing suites:

- `tests/auth-validation.test.ts` — password policy, register/login/reset schemas
- `tests/auth-errors.test.ts` — error-code mapping, no internal details leaked
- `tests/auth-redirects.test.ts` — open-redirect prevention, classId round-tripping
- `tests/profile-validation.test.ts` — profile update schema
- `tests/booking-auth.test.ts` — the client-facing booking schema no longer accepts a
  `userId`, and ownership is enforced on cancellation

## Production deployment considerations

- Set `NEXT_PUBLIC_USE_MOCK_DATA=false` and all four Supabase/site env vars.
- Run the SQL migration against the production database before first deploy.
- Add your production domain's `/auth/callback` URL to Supabase's allowed redirects.
- `SUPABASE_SERVICE_ROLE_KEY` must be set as a server-only/runtime secret in your hosting
  provider — never with a `NEXT_PUBLIC_` prefix, never committed to git.
- Consider adding rate limiting (e.g. at the edge/proxy layer) in front of
  `/api/auth/*`-equivalent Supabase endpoints and `/api/account`, `/api/profile/avatar` —
  this app validates input and enforces identity/ownership everywhere, but doesn't ship
  its own rate limiter.
