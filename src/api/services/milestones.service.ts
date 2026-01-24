import type { SupabaseClient } from "@/db/supabase.client";
import type { MilestoneDto, CreateMilestoneCommand, UpdateMilestoneCommand } from "@/types";

/**
 * Retrieves all milestones for a project, ordered by due date
 * @param projectId - UUID of the project
 * @param supabase - Supabase client instance
 * @returns Array of milestones
 */
export async function getProjectMilestones(projectId: string, supabase: SupabaseClient): Promise<MilestoneDto[]> {
  const { data, error } = await supabase
    .from("milestones")
    .select("*")
    .eq("project_id", projectId)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data || [];
}

/**
 * Creates a new milestone in a project
 * @param projectId - UUID of the project
 * @param command - Command containing milestone details
 * @param supabase - Supabase client instance
 * @returns Created milestone
 * @throws Error if milestone with same name exists or database error occurs
 */
export async function createMilestone(
  projectId: string,
  command: CreateMilestoneCommand,
  supabase: SupabaseClient
): Promise<MilestoneDto> {
  const { data, error } = await supabase
    .from("milestones")
    .insert({
      project_id: projectId,
      name: command.name,
      description: command.description,
      due_date: command.due_date,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      // Unique violation
      throw new Error("Milestone with this name already exists in the project");
    }
    throw error;
  }

  return data;
}

/**
 * Retrieves a single milestone by ID with project information
 * @param milestoneId - UUID of the milestone
 * @param supabase - Supabase client instance
 * @returns Milestone with project details
 * @throws Error if milestone not found or database error occurs
 */
export async function getMilestoneById(
  milestoneId: string,
  supabase: SupabaseClient
): Promise<MilestoneDto & { project_id: string }> {
  const { data, error } = await supabase.from("milestones").select("*").eq("id", milestoneId).single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error("Milestone not found");
    }
    throw error;
  }

  return data;
}

/**
 * Updates an existing milestone
 * @param milestoneId - UUID of the milestone
 * @param command - Command containing fields to update
 * @param supabase - Supabase client instance
 * @returns Updated milestone
 * @throws Error if milestone not found or database error occurs
 */
export async function updateMilestone(
  milestoneId: string,
  command: UpdateMilestoneCommand,
  supabase: SupabaseClient
): Promise<MilestoneDto> {
  const { data, error } = await supabase.from("milestones").update(command).eq("id", milestoneId).select().single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error("Milestone not found");
    }
    if (error.code === "23505") {
      throw new Error("Milestone with this name already exists in the project");
    }
    throw error;
  }

  return data;
}

/**
 * Deletes a milestone
 * @param milestoneId - UUID of the milestone
 * @param supabase - Supabase client instance
 * @throws Error if milestone not found or database error occurs
 */
export async function deleteMilestone(milestoneId: string, supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase.from("milestones").delete().eq("id", milestoneId);

  if (error) {
    throw error;
  }
}

/**
 * Counts tasks assigned to a specific milestone
 * @param milestoneId - UUID of the milestone
 * @param supabase - Supabase client instance
 * @returns Number of tasks assigned to the milestone
 */
export async function countTasksByMilestone(milestoneId: string, supabase: SupabaseClient): Promise<number> {
  const { count, error } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true })
    .eq("milestone_id", milestoneId);

  if (error) throw error;
  return count ?? 0;
}
