-- Migration: Fix RLS circular dependency between projects and project_members
-- Purpose: Update projects SELECT policy to check ownership first, avoiding circular dependency
-- Affected: Updates projects table RLS policy
-- Special considerations: Fixes infinite recursion issue when creating projects

-- Drop the existing SELECT policy that causes circular dependency
drop policy if exists "projects_select_for_members" on public.projects;

-- Create new SELECT policy that checks ownership FIRST (no recursion)
-- Then allows members to see projects (this will work after owner is added as member)
create policy "projects_select_for_members" on public.projects for
select using (
        -- First check: Is the user the owner? (direct check, no recursion)
        owner_id = auth.uid ()
        or
        -- Second check: Is the user a member? (only checked if not owner)
        exists (
            select 1
            from public.project_members
            where
                project_id = projects.id
                and user_id = auth.uid ()
        )
    );

-- Add comment explaining the fix
comment on policy "projects_select_for_members" on public.projects is 'Allow project owners and members to view projects. Owner check first to avoid RLS circular dependency.';