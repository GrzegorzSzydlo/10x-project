import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../db/database.types";
import type { CreateProjectCommand, ProjectDetailsDto } from "../../../types";

export type SupabaseClientType = SupabaseClient<Database>;

/**
 * Service function to create a new project with the user as owner and member.
 * This function handles the business logic for project creation including:
 * - Creating the project record
 * - Adding the owner as a project member
 * - Ensuring data consistency through transaction-like behavior
 */
export async function createProject(
  command: CreateProjectCommand,
  context: {
    ownerId: string;
    supabase: SupabaseClientType;
  }
): Promise<ProjectDetailsDto> {
  const { ownerId, supabase } = context;
  const { name } = command;

  // Step 1: Create the project
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .insert({
      name,
      owner_id: ownerId,
    })
    .select()
    .single();

  if (projectError) {
    throw new Error(`Failed to create project: ${projectError.message}`);
  }

  if (!project) {
    throw new Error("Project creation returned no data");
  }

  // Step 2: Add the owner as a project member
  try {
    const { error: memberError } = await supabase.from("project_members").insert({
      project_id: project.id,
      user_id: ownerId,
    });

    if (memberError) {
      // Compensatory action: delete the project since member creation failed
      await supabase.from("projects").delete().eq("id", project.id);

      throw new Error(`Failed to add project member: ${memberError.message}`);
    }
  } catch (error) {
    // Ensure project is cleaned up if member creation fails
    await supabase.from("projects").delete().eq("id", project.id);

    throw error;
  }

  return project as ProjectDetailsDto;
}
