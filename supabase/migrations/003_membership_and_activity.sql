-- 003_membership_and_activity.sql
-- Adds a personal bio + membership tier to profiles, a membership change
-- log (upgrades/downgrades), 1:1 session bookings, and a profile-view
-- counter. Additive only — does not modify 001 or 002.

alter table public.profiles
  add column if not exists bio text,
  add column if not exists membership_tier text not null default 'free'
    check (membership_tier in ('free', 'foundation', 'performance', 'elite'));

-- Membership change history (task #12: "Membership changes & payment history") --

create table if not exists public.membership_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  from_tier text not null,
  to_tier text not null,
  direction text not null check (direction in ('upgrade', 'downgrade', 'initial')),
  created_at timestamptz not null default now()
);

create index if not exists membership_events_user_id_idx on public.membership_events (user_id, created_at desc);

alter table public.membership_events enable row level security;

create policy "Customers can view their own membership history"
  on public.membership_events
  for select
  using (auth.uid() = user_id);

-- Writes only ever happen through the server-side membership-service using
-- the service-role client (mirrors how /api/account handles deletion) — no
-- insert/update/delete policy is granted to authenticated/anon roles.

-- 1:1 training sessions (task #4 + #12) ------------------------------------

create table if not exists public.trainer_sessions (
  id uuid primary key default gen_random_uuid(),
  trainer_user_id uuid not null references public.profiles (user_id) on delete cascade,
  member_user_id uuid not null references public.profiles (user_id) on delete cascade,
  scheduled_at timestamptz not null,
  duration_minutes int not null default 60,
  status text not null default 'confirmed' check (status in ('confirmed', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

create index if not exists trainer_sessions_member_idx on public.trainer_sessions (member_user_id, scheduled_at desc);
create index if not exists trainer_sessions_trainer_idx on public.trainer_sessions (trainer_user_id, scheduled_at desc);

alter table public.trainer_sessions enable row level security;

create policy "Members can view their own 1:1 sessions"
  on public.trainer_sessions for select
  using (auth.uid() = member_user_id);

create policy "Trainers can view sessions booked with them"
  on public.trainer_sessions for select
  using (auth.uid() = trainer_user_id);

create policy "Elite members can book a 1:1 session"
  on public.trainer_sessions for insert
  with check (
    auth.uid() = member_user_id
    and exists (
      select 1 from public.profiles p
      where p.user_id = auth.uid() and p.membership_tier = 'elite'
    )
  );

-- Extend the public_profiles view (defined in 002) to also expose a
-- member's own personal bio, distinct from a trainer's professional bio in
-- trainer_details. Re-declaring the view here (rather than editing
-- 002's file) is the normal way to evolve a view across migrations.
create or replace view public.public_profiles as
select
  p.user_id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.role,
  p.fitness_goal,
  p.bio as member_bio,
  p.created_at as member_since,
  t.bio as trainer_bio,
  t.specialties,
  t.certifications,
  t.hourly_rate,
  t.social_links,
  t.availability
from public.profiles p
left join public.trainer_details t on t.user_id = p.user_id;

grant select on public.public_profiles to anon, authenticated;

comment on column public.public_profiles.user_id is
  'Exposed for server-side joins only (e.g. looking up a trainer''s upcoming '
  'published classes) — application code (see PublicProfile in types/profile.ts) '
  'never forwards this column to the client.';

create table if not exists public.profile_views (
  id uuid primary key default gen_random_uuid(),
  profile_user_id uuid not null references public.profiles (user_id) on delete cascade,
  viewer_user_id uuid references public.profiles (user_id) on delete set null,
  viewed_at timestamptz not null default now()
);

create index if not exists profile_views_profile_idx on public.profile_views (profile_user_id, viewed_at desc);

alter table public.profile_views enable row level security;

create policy "Customers can view who viewed their own profile"
  on public.profile_views for select
  using (auth.uid() = profile_user_id);

-- Inserts happen via a server-side route using the service-role client
-- (recording a view should never require the viewer to have any special
-- grant, including anonymous visitors), so there is no insert policy for
-- authenticated/anon roles here either.

-- Language preference (task #9) ---------------------------------------------

alter table public.profiles
  add column if not exists language_preference text not null default 'en';

-- Notifications (task #8) ----------------------------------------------------

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (user_id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_idx on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "Customers can view their own notifications"
  on public.notifications for select
  using (auth.uid() = user_id);

create policy "Customers can mark their own notifications as read"
  on public.notifications for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Inserts happen via the server-side notification-service using the
-- service-role client (same pattern as membership_events) — the actions
-- that generate a notification (a booking, a cancellation, a tier change)
-- are already server-authenticated as a DIFFERENT user in general (e.g. the
-- system itself), so there is no insert policy for authenticated/anon here.
