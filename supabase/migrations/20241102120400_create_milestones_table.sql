-- Migration: Create milestones table and RLS policies
-- Purpose: Store project milestones with unique names per project
-- Affected: Creates public.milestones table with RLS and unique constraints
-- Special considerations: Unique constraint on (project_id, name) combination

-- Create milestones table to store project milestones
-- Milestones are project-specific goals with optional due dates
create table public.milestones (
  -- Primary key with auto-generated UUID
  id uuid primary key default gen_random_uuid(),

-- Reference to parent project with cascade delete
project_id uuid not null references public.projects (id) on delete cascade,

-- Milestone information
name text not null, description text, due_date date,

-- Audit timestamps
created_at timestamptz not null default now (),
updated_at timestamptz not null default now (),

-- Ensure milestone names are unique within each project
unique (project_id, name) );

-- Enable Row Level Security on milestones table
-- This ensures only project members can access milestone data
alter table public.milestones enable row level security;

-- RLS Policy: Allow project members to view milestones (SELECT)
-- Users can view milestones for projects they are members of
create policy "milestones_select_for_project_members" on public.milestones for
select using (
        exists (
            select 1
            from public.project_members
            where
                project_id = milestones.project_id
                and user_id = auth.uid ()
        )
    );

-- RLS Policy: Allow project members to create milestones (INSERT)
-- Project members can add milestones to their projects
create policy "milestones_insert_for_project_members" on public.milestones for
insert
with
    check (
        exists (
            select 1
            from public.project_members
            where
                project_id = milestones.project_id
                and user_id = auth.uid ()
        )
    );

-- RLS Policy: Allow project members to update milestones (UPDATE)
-- Project members can modify milestones in their projects
create policy "milestones_update_for_project_members" on public.milestones for
update using (
    exists (
        select 1
        from public.project_members
        where
            project_id = milestones.project_id
            and user_id = auth.uid ()
    )
);

-- RLS Policy: Allow project members to delete milestones (DELETE)
-- Project members can remove milestones from their projects
create policy "milestones_delete_for_project_members" on public.milestones for
delete using (
    exists (
        select 1
        from public.project_members
        where
            project_id = milestones.project_id
            and user_id = auth.uid ()
    )
);

-- Add table and column comments for documentation
comment on
table public.milestones is 'Project milestones with unique names per project';

comment on column public.milestones.id is 'Auto-generated UUID primary key';

comment on column public.milestones.project_id is 'References projects(id) with cascade delete';

comment on column public.milestones.name is 'Milestone name - must be unique within project';

comment on column public.milestones.description is 'Optional detailed description of milestone';

comment on column public.milestones.due_date is 'Optional target completion date';