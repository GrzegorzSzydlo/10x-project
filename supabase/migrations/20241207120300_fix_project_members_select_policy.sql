-- Migration: Fix all project_members policies to avoid RLS recursion
-- Purpose: Update SELECT and DELETE policies to use security definer helper function
-- Affected: Updates project_members SELECT and DELETE policies
-- Special considerations: Uses security definer helper function to avoid RLS recursion

-- Fix SELECT policy: remove self-reference
drop policy if exists "project_members_select_for_members" on public.project_members;

create policy "project_members_select_for_members" on public.project_members for
select using (
        -- Allow if user is the project owner (using security definer helper)
        public.is_project_owner (project_id, auth.uid ())
        OR
        -- Allow if user is the member being viewed (can see yourself)
        user_id = auth.uid ()
    );

-- Fix DELETE policy: use security definer helper instead of direct EXISTS
drop policy if exists "project_members_delete_for_owners" on public.project_members;

create policy "project_members_delete_for_owners" on public.project_members for
delete using (
    -- Use the helper function to check ownership without RLS recursion
    public.is_project_owner (project_id, auth.uid ())
);

-- Add comments
comment on policy "project_members_select_for_members" on public.project_members is 'Allow project owners and the member themselves to view membership. Uses security definer helper to avoid RLS recursion.';

comment on policy "project_members_delete_for_owners" on public.project_members is 'Allow project owners to delete members. Uses security definer helper to avoid RLS recursion.';