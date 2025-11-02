-- Migration: Update projects RLS policy to include project members
-- Purpose: Replace the owner-only SELECT policy with a policy that includes all project members
-- Affected: Updates projects table RLS policy to check project_members table
-- Special considerations: This migration depends on project_members table being created first

-- Drop the temporary owner-only SELECT policy
drop policy if exists "projects_select_for_owners" on public.projects;

-- Create the full project members SELECT policy
-- Users can view projects where they are members (including owner via project_members table)
create policy "projects_select_for_members" on public.projects for
select using (
        exists (
            select 1
            from public.project_members
            where
                project_id = projects.id
                and user_id = auth.uid ()
        )
    );

-- Add comment explaining the policy update
comment on policy "projects_select_for_members" on public.projects is 'Allow project members to view projects they belong to (includes owner via project_members)';