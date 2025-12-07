-- Migration: Remove trigger that causes RLS circular dependency
-- Purpose: Application code will handle adding owner as member instead of trigger
-- Affected: Removes trigger and function that automatically add owner as member
-- Special considerations: This prevents infinite recursion in RLS policies
--                        The application code already handles adding owner as member

-- Drop the trigger that causes RLS issues
drop
trigger if exists on_project_created_add_owner on public.projects;

-- Drop the function (use cascade to handle dependencies)
drop function if exists public.add_owner_as_member () cascade;

-- Add comment explaining why trigger was removed
comment on
table public.projects is 'Projects table. Owner is added as member by application code, not trigger, to avoid RLS circular dependency.';