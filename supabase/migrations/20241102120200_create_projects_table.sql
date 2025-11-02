-- Migration: Create projects table and RLS policies
-- Purpose: Store project information with ownership and member access control
-- Affected: Creates public.projects table with RLS enabled
-- Special considerations: References users table for project ownership

-- Create projects table to store project information
-- Each project has an owner and can have multiple members
create table public.projects (
  -- Primary key with auto-generated UUID
  id uuid primary key default gen_random_uuid(),

-- Project information
name text not null,

-- Project owner reference - user who created/owns the project
owner_id uuid not null references public.users (id),

-- Audit timestamps
created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Enable Row Level Security on projects table
-- This ensures only project members can access project data
alter table public.projects enable row level security;

-- RLS Policy: Allow project owners to view their projects (SELECT)
-- Initially only allow owners to view projects - will be updated after project_members table is created
create policy "projects_select_for_owners" on public.projects for
select using (owner_id = auth.uid ());

-- RLS Policy: Allow project owners to update projects
-- Only project owners can modify project information
create policy "projects_update_for_owners" on public.projects for
update using (owner_id = auth.uid ());

-- RLS Policy: Allow authenticated users to create projects
-- Any authenticated user can create a new project
create policy "projects_insert_for_authenticated" on public.projects for
insert
    to authenticated
with
    check (auth.uid () = owner_id);

-- RLS Policy: Allow project owners to delete projects
-- Only project owners can delete their projects
create policy "projects_delete_for_owners" on public.projects for
delete using (owner_id = auth.uid ());

-- Add table and column comments for documentation
comment on
table public.projects is 'Projects with ownership and member-based access control';

comment on column public.projects.id is 'Auto-generated UUID primary key';

comment on column public.projects.name is 'Human-readable project name';

comment on column public.projects.owner_id is 'References users(id) - project creator and owner';