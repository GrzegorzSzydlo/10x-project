-- Migration: Create users table and RLS policies
-- Purpose: Store user profiles linked to Supabase Auth users
-- Affected: Creates public.users table with RLS enabled
-- Special considerations: References auth.users(id) for Supabase Auth integration

-- Create users table to store user profiles
-- This table extends Supabase Auth with additional user information
create table public.users (
  -- Primary key linked to Supabase Auth user
  id uuid primary key references auth.users(id) on delete cascade,

-- User profile information
first_name text, last_name text, avatar_url text,

-- User role in the system with default team_member
role public.user_role not null default 'team_member',

-- Audit timestamps
created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security on users table
-- This ensures users can only access their own profile data
alter table public.users enable row level security;

-- RLS Policy: Allow users to view their own profile
-- Users can only select their own user record
create policy "users_select_own_profile" on public.users for
select using (auth.uid () = id);

-- RLS Policy: Allow users to update their own profile
-- Users can modify their own profile information
create policy "users_update_own_profile" on public.users for
update using (auth.uid () = id);

-- RLS Policy: Allow authenticated users to insert their profile
-- Users can create their own profile record after signup
create policy "users_insert_own_profile" on public.users for
insert
with
    check (auth.uid () = id);

-- Add table comment for documentation
comment on
table public.users is 'User profiles extending Supabase Auth with additional information';

comment on column public.users.id is 'References auth.users(id) - primary key from Supabase Auth';

comment on column public.users.role is 'User role: administrator, project_manager, or team_member';

comment on column public.users.avatar_url is 'URL to user avatar image';