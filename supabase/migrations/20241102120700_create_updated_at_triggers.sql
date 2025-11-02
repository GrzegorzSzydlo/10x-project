-- Migration: Create updated_at trigger function and apply to tables
-- Purpose: Automatically update updated_at timestamps when records are modified
-- Affected: Creates reusable trigger function and applies to users, projects, milestones, and tasks tables
-- Special considerations: Uses SECURITY DEFINER for consistent behavior across all tables

-- Create reusable trigger function to handle updated_at timestamps
-- This function automatically sets updated_at to current timestamp on row updates
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  -- Set the updated_at field to current timestamp
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Apply updated_at trigger to users table
-- Automatically updates timestamp when user profile is modified
create trigger on_users_updated
  before update on public.users
  for each row
  execute function public.handle_updated_at();

-- Apply updated_at trigger to projects table
-- Automatically updates timestamp when project information is modified
create trigger on_projects_updated
  before update on public.projects
  for each row
  execute function public.handle_updated_at();

-- Apply updated_at trigger to milestones table
-- Automatically updates timestamp when milestone information is modified
create trigger on_milestones_updated
  before update on public.milestones
  for each row
  execute function public.handle_updated_at();

-- Apply updated_at trigger to tasks table
-- Automatically updates timestamp when task information is modified
create trigger on_tasks_updated
  before update on public.tasks
  for each row
  execute function public.handle_updated_at();

-- Add function comment for documentation
comment on
function public.handle_updated_at () is 'Trigger function to automatically update updated_at timestamp on row modification';

-- Note: project_members and task_history tables do not have updated_at columns
-- project_members: Junction table with only created_at (memberships are created/deleted, not updated)
-- task_history: Audit table where records should never be modified after creation