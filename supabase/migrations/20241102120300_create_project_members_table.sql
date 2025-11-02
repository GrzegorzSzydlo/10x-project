-- Migration: Create project_members junction table and RLS policies
-- Purpose: Many-to-many relationship between users and projects
-- Affected: Creates public.project_members table with composite primary key and RLS
-- Special considerations: Junction table with cascading deletes to maintain referential integrity

-- Create project_members junction table
-- Manages many-to-many relationship between users and projects
create table public.project_members (
  -- Composite primary key (project_id, user_id)
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,

-- Audit timestamp for when user joined project
created_at timestamptz not null default now (),

-- Define composite primary key
primary key (project_id, user_id) );

-- Enable Row Level Security on project_members table
-- This controls who can see and manage project memberships
alter table public.project_members enable row level security;

-- RLS Policy: Allow project members to view other members (SELECT)
-- Users can see all members of projects they belong to
create policy "project_members_select_for_members" on public.project_members for
select using (
        exists (
            select 1
            from public.project_members as pm
            where
                pm.project_id = project_members.project_id
                and pm.user_id = auth.uid ()
        )
    );

-- RLS Policy: Allow project owners to add members (INSERT)
-- Only project owners can add new members to their projects
create policy "project_members_insert_for_owners" on public.project_members for
insert
with
    check (
        exists (
            select 1
            from public.projects
            where
                id = project_id
                and owner_id = auth.uid ()
        )
    );

-- RLS Policy: Allow project owners to remove members (DELETE)
-- Only project owners can remove members from their projects
create policy "project_members_delete_for_owners" on public.project_members for
delete using (
    exists (
        select 1
        from public.projects
        where
            id = project_id
            and owner_id = auth.uid ()
    )
);

-- Create function to automatically add project owner as member
-- This ensures the project owner is always a member of their own project
create or replace function public.add_owner_as_member()
returns trigger as $$
begin
  -- Insert the project owner as a project member
  insert into public.project_members (project_id, user_id)
  values (new.id, new.owner_id);
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically add owner as member when project is created
create trigger on_project_created_add_owner
  after insert on public.projects
  for each row
  execute function public.add_owner_as_member();

-- Add table and column comments for documentation
comment on
table public.project_members is 'Junction table managing many-to-many relationship between users and projects';

comment on column public.project_members.project_id is 'References projects(id) with cascade delete';

comment on column public.project_members.user_id is 'References users(id) with cascade delete';

comment on column public.project_members.created_at is 'Timestamp when user was added to project';