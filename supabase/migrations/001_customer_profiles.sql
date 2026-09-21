-- 001_customer_profiles.sql
-- Customer profile table, RLS policies, and the trigger that creates a
-- profile automatically whenever a new Supabase Auth user is created.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  display_name text not null,
  email text not null,
  avatar_url text,
  phone text,
  fitness_goal text check (
    fitness_goal is null or fitness_goal in (
      'build-strength', 'lose-fat', 'improve-conditioning', 'mobility-recovery', 'general-fitness'
    )
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_user_id_idx on public.profiles (user_id);
create unique index if not exists profiles_email_idx on public.profiles (email);

-- Keep updated_at current on every UPDATE.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- Automatically create a profile row when a new auth user signs up,
-- pulling first/last name out of the metadata passed to supabase.auth.signUp
-- (see SupabaseAuthService.signUp in src/lib/auth/auth-service.ts).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, first_name, last_name, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    trim(
      coalesce(new.raw_user_meta_data ->> 'first_name', '') || ' ' ||
      coalesce(new.raw_user_meta_data ->> 'last_name', '')
    ),
    new.email
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Row Level Security -------------------------------------------------------
-- Customers may only ever read or modify their OWN profile row. There is no
-- `using (true)` anywhere here — every policy is scoped to `auth.uid()`.

alter table public.profiles enable row level security;

create policy "Profiles are viewable by their owner only"
  on public.profiles
  for select
  using (auth.uid() = user_id);

create policy "Profiles are updatable by their owner only"
  on public.profiles
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No insert/delete policy for regular users: profile rows are created only
-- by the handle_new_user() trigger (which runs as security definer) and
-- deleted only via the `on delete cascade` when the auth user is removed
-- (see /api/account's DELETE handler, which uses the service-role client to
-- delete the auth user — profiles.user_id's cascade handles the row).

-- Storage: avatars bucket ---------------------------------------------------
-- Run this once storage is enabled for the project. Files are stored under
-- `${user_id}/avatar.<ext>` (see src/app/api/profile/avatar/route.ts), so the
-- policies below key off the first path segment matching the caller's uid.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Customers can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Customers can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Customers can delete their own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
