import type { SupabaseClient } from "@/db/supabase.client";
import type { ProjectDetailsDto } from "@/types";

/**
 * Retrieves a project by its ID
 * @param projectId - UUID of the project
 * @param supabase - Supabase client instance
 * @returns Project details or null if not found
 */
export async function getProjectById(projectId: string, supabase: SupabaseClient): Promise<ProjectDetailsDto | null> {
  const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).single();

  if (error) {
    if (error.code === "PGRST116") return null; // Not found
    throw error;
  }

  return data;
}

/**
 * Checks if a user is a member of a project
 * @param projectId - UUID of the project
 * @param userId - UUID of the user
 * @param supabase - Supabase client instance
 * @returns True if user is a member, false otherwise
 */
export async function isProjectMember(projectId: string, userId: string, supabase: SupabaseClient): Promise<boolean> {
  const { data, error } = await supabase
    .from("project_members")
    .select("user_id")
    .eq("project_id", projectId)
    .eq("user_id", userId)
    .maybeSingle();

  return !!data && !error;
}
