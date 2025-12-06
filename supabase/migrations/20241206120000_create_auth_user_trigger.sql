-- Migration: Create trigger to automatically create user profile on auth signup
-- Purpose: Automatically populate public.users table when a new auth.users record is created
-- Affected: Creates trigger function and trigger on auth.users
-- Special considerations: Ensures every authenticated user has a profile in public.users

-- Create function to handle new user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, role, created_at, updated_at)
  values (
    new.id,
    'team_member', -- Default role for new users
    now(),
    now()
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger on auth.users to call handle_new_user function
-- This runs after a new user is inserted into auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Add comment for documentation
comment on
function public.handle_new_user () is 'Automatically creates user profile in public.users when auth user is created';