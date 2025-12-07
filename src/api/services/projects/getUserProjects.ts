import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../db/database.types";
import type { ProjectDto } from "../../../types";

type ServiceSupabaseClient = SupabaseClient<Database>;

interface GetUserProjectsOptions {
  userId: string;
  supabase: ServiceSupabaseClient;
}

/**
 * Retrieves all projects where the user is a member
 */
export async function getUserProjects({ userId, supabase }: GetUserProjectsOptions): Promise<ProjectDto[]> {
  // Get projects where user is a member through project_members table
  const { data: projectMemberships, error: membershipError } = await supabase
    .from("project_members")
    .select(
      `
      project:projects (
        id,
        name,
        owner_id,
        created_at
      )
    `
    )
    .eq("user_id", userId);

  if (membershipError) {
    throw new Error(`Failed to fetch user projects: ${membershipError.message}`);
  }

  // Transform the data to match ProjectDto shape
  const projects: ProjectDto[] = projectMemberships
    .map((membership) => membership.project)
    .filter((project) => project !== null)
    .map((project) => ({
      id: project.id,
      name: project.name,
      owner_id: project.owner_id,
      created_at: project.created_at,
    }));

  // Sort by creation date (newest first)
  return projects.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
