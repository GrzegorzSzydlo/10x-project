-- Migration: Fix project_members INSERT policy to avoid circular dependency
-- Purpose: Create a helper function to check ownership without RLS recursion
-- Affected: Creates helper function and updates project_members INSERT policy
-- Special considerations: Breaks circular dependency with projects table using security definer

-- Create a security definer function to check if user is project owner
-- This function bypasses RLS, preventing circular dependency
create or replace function public.is_project_owner(project_uuid uuid, user_uuid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.projects
    where id = project_uuid
    and owner_id = user_uuid
  );
$$;

-- Drop the existing INSERT policy that causes circular dependency
drop policy if exists "project_members_insert_for_owners" on public.project_members;

-- Create new INSERT policy using the helper function
-- This avoids RLS recursion by using security definer function
create policy "project_members_insert_for_owners" on public.project_members for
insert
with
    check (
        -- Use the helper function to check ownership without RLS recursion
        public.is_project_owner (project_id, auth.uid ())
    );

-- Add comments
comment on function public.is_project_owner(uuid, uuid) is 'Helper function to check project ownership without RLS recursion. Uses security definer to bypass RLS.';

comment on policy "project_members_insert_for_owners" on public.project_members is 'Allow project owners to add members using security definer helper to avoid RLS recursion';