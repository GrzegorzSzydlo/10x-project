-- Migration: Create tasks table with RLS policies and performance indexes
-- Purpose: Store tasks and subtasks with Kanban workflow support
-- Affected: Creates public.tasks table with RLS, self-referencing relationships, and optimized indexes
-- Special considerations: Self-referencing parent_task_id for subtasks, display_order for Kanban positioning

-- Create tasks table to store tasks and subtasks
-- Supports hierarchical task structure and Kanban workflow
create table public.tasks (
  -- Primary key with auto-generated UUID
  id uuid primary key default gen_random_uuid(),

-- Reference to parent project with cascade delete
project_id uuid not null references public.projects (id) on delete cascade,

-- Optional reference to milestone (set to null if milestone deleted)
milestone_id uuid references public.milestones (id) on delete set null,

-- Optional assignee (set to null if user deleted)
assignee_id uuid references public.users (id) on delete set null,

-- Self-referencing for subtasks (cascade delete subtasks when parent deleted)
parent_task_id uuid references public.tasks (id) on delete cascade,

-- Task information
title text not null, description text,

-- Task workflow status with default 'To Do'
status public.task_status not null default 'To Do',

-- Display order for Kanban board positioning (double precision for flexibility)
display_order double precision,

-- Optional due date with timezone support
due_date timestamptz,

-- Audit timestamps
created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Create performance indexes as specified in the database plan
-- Index for project-based queries (most common access pattern)
create index idx_tasks_project_id on public.tasks (project_id);

-- Index for assignee-based queries (user's assigned tasks)
create index idx_tasks_assignee_id on public.tasks (assignee_id);

-- Index for milestone-based queries (milestone progress tracking)
create index idx_tasks_milestone_id on public.tasks (milestone_id);

-- Index for parent task queries (subtask management)
create
index idx_tasks_parent_task_id on public.tasks (parent_task_id);

-- Composite index for Kanban board optimization (project + status)
-- This optimizes queries for displaying tasks by status within a project
create
index idx_tasks_project_status on public.tasks (project_id, status);

-- Enable Row Level Security on tasks table
-- This ensures only project members can access task data
alter table public.tasks enable row level security;

-- RLS Policy: Allow project members to view tasks (SELECT)
-- Users can view tasks for projects they are members of
create policy "tasks_select_for_project_members" on public.tasks for
select using (
        exists (
            select 1
            from public.project_members
            where
                project_id = tasks.project_id
                and user_id = auth.uid ()
        )
    );

-- RLS Policy: Allow project members to create tasks (INSERT)
-- Project members can add tasks to their projects
create policy "tasks_insert_for_project_members" on public.tasks for
insert
with
    check (
        exists (
            select 1
            from public.project_members
            where
                project_id = tasks.project_id
                and user_id = auth.uid ()
        )
    );

-- RLS Policy: Allow project members to update tasks (UPDATE)
-- Project members can modify tasks in their projects
create policy "tasks_update_for_project_members" on public.tasks for
update using (
    exists (
        select 1
        from public.project_members
        where
            project_id = tasks.project_id
            and user_id = auth.uid ()
    )
);

-- RLS Policy: Allow project members to delete tasks (DELETE)
-- Project members can remove tasks from their projects
create policy "tasks_delete_for_project_members" on public.tasks for
delete using (
    exists (
        select 1
        from public.project_members
        where
            project_id = tasks.project_id
            and user_id = auth.uid ()
    )
);

-- Add table and column comments for documentation
comment on
table public.tasks is 'Tasks and subtasks with Kanban workflow and hierarchical structure';

comment on column public.tasks.id is 'Auto-generated UUID primary key';

comment on column public.tasks.project_id is 'References projects(id) with cascade delete';

comment on column public.tasks.milestone_id is 'Optional milestone association - nullable if milestone deleted';

comment on column public.tasks.assignee_id is 'Optional user assignment - nullable if user deleted';

comment on column public.tasks.parent_task_id is 'Self-reference for subtasks - cascade delete subtasks';

comment on column public.tasks.status is 'Workflow status: To Do, In Progress, Testing, Done';

comment on column public.tasks.display_order is 'Position on Kanban board - double precision for flexible ordering';

comment on column public.tasks.due_date is 'Optional task deadline with timezone support';