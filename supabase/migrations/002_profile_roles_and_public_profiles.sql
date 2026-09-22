-- 002_profile_roles_and_public_profiles.sql
-- Adds role + username to profiles, a trainer_details table for
-- trainer-only fields, and the public-read policies that back
-- /profile/[username]. Builds on 001_customer_profiles.sql — does not
-- modify or drop anything from it.

-- profiles: role + username --------------------------------------------

alter table public.profiles
  add column if not exists role text not null default 'member'
    check (role in ('member', 'trainer')),
  add column if not exists username text;

-- Case-insensitive uniqueness: "JaneDoe" and "janedoe" must not collide.
create unique index if not exists profiles_username_unique_idx
  on public.profiles (lower(username));

-- trainer_details: 1:1 extension of profiles, trainer-only fields --------

create table if not exists public.trainer_details (
  user_id uuid primary key references public.profiles (user_id) on delete cascade,
  bio text not null default '',
  specialties text[] not null default '{}',
  certifications text[] not null default '{}',
  hourly_rate numeric(10, 2),
  social_links jsonb not null default '{}'::jsonb,
  availability jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

drop trigger if exists set_trainer_details_updated_at on public.trainer_details;
create trigger set_trainer_details_updated_at
  before update on public.trainer_details
  for each row
  execute function public.set_updated_at(); -- reuses the function from 001

-- Username generation on signup ------------------------------------------
-- Slugifies "first last", appends a short suffix from the new user's own id
-- on the (rare) collision, and retries a few times before falling back to
-- the full id. Called from handle_new_user() below — the trigger already
-- defined in 001 is replaced here to also set username/role and to seed an
-- empty trainer_details row when role = 'trainer'.

create or replace function public.generate_unique_username(base text, seed_id uuid)
returns text
language plpgsql
as $$
declare
  candidate text;
  slug text;
  attempt int := 0;
begin
  slug := lower(regexp_replace(trim(base), '[^a-zA-Z0-9]+', '', 'g'));
  if slug = '' then
    slug := 'member';
  end if;

  candidate := slug;
  while exists (select 1 from public.profiles p where lower(p.username) = lower(candidate)) loop
    attempt := attempt + 1;
    if attempt > 5 then
      candidate := slug || substr(replace(seed_id::text, '-', ''), 1, 8);
      exit;
    end if;
    candidate := slug || substr(replace(seed_id::text, '-', ''), 1, 4 + attempt);
  end loop;

  return candidate;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  requested_role text;
  new_username text;
  first_name text;
  last_name text;
begin
  first_name := coalesce(new.raw_user_meta_data ->> 'first_name', '');
  last_name := coalesce(new.raw_user_meta_data ->> 'last_name', '');

  -- Only 'member' or 'trainer' are ever honored; anything else (or absent)
  -- defaults to 'member' — a customer can never grant themselves a role by
  -- tampering with the signup payload beyond this whitelist.
  requested_role := coalesce(new.raw_user_meta_data ->> 'role', 'member');
  if requested_role not in ('member', 'trainer') then
    requested_role := 'member';
  end if;

  new_username := public.generate_unique_username(first_name || last_name, new.id);

  insert into public.profiles (user_id, first_name, last_name, display_name, email, role, username)
  values (
    new.id,
    first_name,
    last_name,
    trim(first_name || ' ' || last_name),
    new.email,
    requested_role,
    new_username
  );

  if requested_role = 'trainer' then
    insert into public.trainer_details (user_id) values (new.id);
  end if;

  return new;
end;
$$;
-- on_auth_user_created already points at handle_new_user() from 001; no
-- need to redefine the trigger itself, only the function body above.

-- Row Level Security -------------------------------------------------------

alter table public.trainer_details enable row level security;

-- Trainer bios/rates/availability are public marketing content by design —
-- this is the one deliberate exception to "no using (true)" in this schema,
-- and it is scoped to a table that holds nothing but already-public data
-- (no email, no phone, no auth-related fields ever live here).
create policy "Trainer details are publicly readable"
  on public.trainer_details
  for select
  using (true);

create policy "Trainers can update their own details"
  on public.trainer_details
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- profiles itself stays exactly as locked down as in 001 (owner-only
-- select/update) — public profile reads go through a dedicated view
-- instead of loosening that table's policies:

create or replace view public.public_profiles as
select
  p.username,
  p.display_name,
  p.avatar_url,
  p.role,
  p.fitness_goal,
  p.created_at as member_since,
  t.bio,
  t.specialties,
  t.certifications,
  t.hourly_rate,
  t.social_links,
  t.availability
from public.profiles p
left join public.trainer_details t on t.user_id = p.user_id;

grant select on public.public_profiles to anon, authenticated;

comment on view public.public_profiles is
  'Public-safe projection of profiles/trainer_details. Never includes email, '
  'phone, user_id, or any other private column — this is what GET '
  '/api/public-profiles/[username] and SupabaseProfileRepository.getPublicProfile() '
  'query against, instead of the base tables.';
