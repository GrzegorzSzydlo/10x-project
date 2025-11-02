-- Migration: Create ENUM types for user roles and task statuses
-- Purpose: Define custom enumeration types used throughout the application
-- Affected: Creates user_role and task_status ENUMs in public schema

-- Create user_role ENUM type
-- This defines the different roles a user can have in the system
-- administrator: full system access and user management
-- project_manager: can create and manage projects
-- team_member: standard user with limited permissions
create
type public.user_role as enum (
    'administrator',
    'project_manager',
    'team_member'
);

-- Create task_status ENUM type  
-- This defines the possible states for tasks in the Kanban workflow
-- To Do: newly created tasks awaiting work
-- In Progress: tasks currently being worked on
-- Testing: tasks completed but under review/testing
-- Done: fully completed tasks
create
type public.task_status as enum (
    'To Do',
    'In Progress',
    'Testing',
    'Done'
);

-- Add comments to document the ENUM types
comment on
type public.user_role is 'Defines user roles: administrator, project_manager, team_member';

comment on
type public.task_status is 'Defines task workflow states: To Do, In Progress, Testing, Done';