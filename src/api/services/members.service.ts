import type { SupabaseClient } from "@/db/supabase.client";
import type { ProjectMemberDto, AddProjectMemberCommand } from "@/types";
import { isProjectMember } from "./projects.service";

/**
 * Retrieves all members of a project with their user details
 * @param projectId - UUID of the project
 * @param supabase - Supabase client instance
 * @returns Array of project members with user details
 */
export async function getProjectMembers(projectId: string, supabase: SupabaseClient): Promise<ProjectMemberDto[]> {
  const { data, error } = await supabase
    .from("project_members")
    .select(
      `
      user_id,
      users!inner (
        first_name,
        last_name,
        avatar_url,
        role
      )
    `
    )
    .eq("project_id", projectId);

  if (error) throw error;

  // Map the nested structure to flat ProjectMemberDto
  return (data || []).map((item) => ({
    user_id: item.user_id,
    first_name: item.users.first_name,
    last_name: item.users.last_name,
    avatar_url: item.users.avatar_url,
    role: item.users.role,
  }));
}

/**
 * Adds a user to a project
 * @param projectId - UUID of the project
 * @param command - Command containing user_id to add
 * @param supabase - Supabase client instance
 * @returns Created project member record
 * @throws Error if user is already a member or database error occurs
 */
export async function addProjectMember(projectId: string, command: AddProjectMemberCommand, supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("project_members")
    .insert({
      project_id: projectId,
      user_id: command.user_id,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      // Unique violation
      throw new Error("User is already a member of this project");
    }
    throw error;
  }

  return data;
}

/**
 * Removes a user from a project
 * @param projectId - UUID of the project
 * @param userId - UUID of the user to remove
 * @param supabase - Supabase client instance
 * @throws Error if database error occurs
 */
export async function removeProjectMember(projectId: string, userId: string, supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase.from("project_members").delete().eq("project_id", projectId).eq("user_id", userId);

  if (error) throw error;
}

/**
 * Checks if a user has project manager permissions for a project
 * User is a project manager if they have 'administrator' or 'project_manager' role
 * and are a member of the project
 * @param projectId - UUID of the project
 * @param userId - UUID of the user
 * @param supabase - Supabase client instance
 * @returns True if user is a project manager, false otherwise
 */
export async function isProjectManager(projectId: string, userId: string, supabase: SupabaseClient): Promise<boolean> {
  const { data: user } = await supabase.from("users").select("role").eq("id", userId).single();

  if (!user) return false;

  // Administrator always has access
  if (user.role === "administrator") return true;

  // Project manager must be a member of the project
  if (user.role === "project_manager") {
    return await isProjectMember(projectId, userId, supabase);
  }

  return false;
}

/**
 * Checks if a user exists in the system
 * @param userId - UUID of the user
 * @param supabase - Supabase client instance
 * @returns True if user exists, false otherwise
 */
export async function userExists(userId: string, supabase: SupabaseClient): Promise<boolean> {
  const { data } = await supabase.from("users").select("id").eq("id", userId).maybeSingle();

  return !!data;
}
