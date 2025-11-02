-- Migration: Create task_history table with RLS policies and performance indexes
-- Purpose: Store audit trail of task changes for compliance and debugging
-- Affected: Creates public.task_history table with RLS and optimized indexes
-- Special considerations: Uses BIGSERIAL for high-volume insert performance, stores change metadata

-- Create task_history table to store task change audit trail
-- Tracks all modifications to tasks for auditing and debugging purposes
create table public.task_history (
  -- Primary key with auto-incrementing BIGSERIAL for performance
  id bigserial primary key,

-- Reference to task with cascade delete (remove history when task deleted)
task_id uuid not null references public.tasks (id) on delete cascade,

-- User who made the change (nullable if user deleted)
user_id uuid references public.users (id) on delete set null,

-- Change metadata
changed_field text not null, old_value text, new_value text,

-- Timestamp of change
changed_at timestamptz not null default now() );

-- Create performance index for task-based history queries
-- This is the primary access pattern - getting history for a specific task
create
index idx_task_history_task_id on public.task_history (task_id);

-- Create composite index for task history ordered by time
-- Optimizes queries for chronological task change history
create
index idx_task_history_task_time on public.task_history (task_id, changed_at desc);

-- Enable Row Level Security on task_history table
-- This ensures only project members can access task change history
alter table public.task_history enable row level security;

-- RLS Policy: Allow project members to view task history (SELECT)
-- Users can view change history for tasks in projects they are members of
create policy "task_history_select_for_project_members" on public.task_history for
select using (
        exists (
            select 1
            from public.tasks t
                join public.project_members pm on pm.project_id = t.project_id
            where
                t.id = task_history.task_id
                and pm.user_id = auth.uid ()
        )
    );

-- RLS Policy: Allow project members to create history entries (INSERT)
-- System/triggers can insert history entries for tasks in accessible projects
-- Note: This is typically used by triggers, not direct user inserts
create policy "task_history_insert_for_project_members" on public.task_history for
insert
with
    check (
        exists (
            select 1
            from public.tasks t
                join public.project_members pm on pm.project_id = t.project_id
            where
                t.id = task_history.task_id
                and pm.user_id = auth.uid ()
        )
    );

-- Create function to automatically track task changes
-- This function will be used by triggers to log all task modifications
create or replace function public.log_task_changes()
returns trigger as $$
declare
  field_name text;
  old_val text;
  new_val text;
begin
  -- Only log changes for UPDATE operations
  if tg_op = 'UPDATE' then
    -- Check each field that might have changed and log differences
    
    if old.title is distinct from new.title then
      insert into public.task_history (task_id, user_id, changed_field, old_value, new_value)
      values (new.id, auth.uid(), 'title', old.title, new.title);
    end if;
    
    if old.description is distinct from new.description then
      insert into public.task_history (task_id, user_id, changed_field, old_value, new_value)
      values (new.id, auth.uid(), 'description', old.description, new.description);
    end if;
    
    if old.status is distinct from new.status then
      insert into public.task_history (task_id, user_id, changed_field, old_value, new_value)
      values (new.id, auth.uid(), 'status', old.status::text, new.status::text);
    end if;
    
    if old.assignee_id is distinct from new.assignee_id then
      insert into public.task_history (task_id, user_id, changed_field, old_value, new_value)
      values (new.id, auth.uid(), 'assignee_id', old.assignee_id::text, new.assignee_id::text);
    end if;
    
    if old.milestone_id is distinct from new.milestone_id then
      insert into public.task_history (task_id, user_id, changed_field, old_value, new_value)
      values (new.id, auth.uid(), 'milestone_id', old.milestone_id::text, new.milestone_id::text);
    end if;
    
    if old.parent_task_id is distinct from new.parent_task_id then
      insert into public.task_history (task_id, user_id, changed_field, old_value, new_value)
      values (new.id, auth.uid(), 'parent_task_id', old.parent_task_id::text, new.parent_task_id::text);
    end if;
    
    if old.due_date is distinct from new.due_date then
      insert into public.task_history (task_id, user_id, changed_field, old_value, new_value)
      values (new.id, auth.uid(), 'due_date', old.due_date::text, new.due_date::text);
    end if;
    
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger to automatically log task changes
create trigger on_task_changed_log_history
  after update on public.tasks
  for each row
  execute function public.log_task_changes();

-- Add table and column comments for documentation
comment on
table public.task_history is 'Audit trail of task changes for compliance and debugging';

comment on column public.task_history.id is 'Auto-incrementing BIGSERIAL primary key for performance';

comment on column public.task_history.task_id is 'References tasks(id) with cascade delete';

comment on column public.task_history.user_id is 'User who made the change - nullable if user deleted';

comment on column public.task_history.changed_field is 'Name of the task field that was modified';

comment on column public.task_history.old_value is 'Previous value of the field (text representation)';

comment on column public.task_history.new_value is 'New value of the field (text representation)';

comment on column public.task_history.changed_at is 'Timestamp when change occurred';