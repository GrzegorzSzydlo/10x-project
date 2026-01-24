import type { APIRoute } from "astro";
import { milestoneIdParamSchema, updateMilestoneSchema } from "@/api/validation/projects.schemas";
import * as milestonesService from "@/api/services/milestones.service";
import * as membersService from "@/api/services/members.service";
import * as projectsService from "@/api/services/projects.service";
import { jsonResponse, errorResponse } from "@/api/utils";

export const prerender = false;

/**
 * GET /api/milestones/{milestoneId}
 * Retrieves a single milestone by ID
 *
 * @requires Authentication - User must be authenticated
 * @requires Authorization - User must be a member of the milestone's project
 *
 * @returns 200 - Milestone details
 * @returns 400 - Invalid milestone ID format
 * @returns 401 - User not authenticated
 * @returns 403 - User not a member of the project
 * @returns 404 - Milestone not found
 * @returns 500 - Internal server error
 */
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    // 1. Check authentication
    const user = locals.user;
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    // 2. Validate params
    const validation = milestoneIdParamSchema.safeParse(params);
    if (!validation.success) {
      return errorResponse("Invalid milestone ID", 400);
    }

    const { milestoneId } = validation.data;
    const supabase = locals.supabase;

    // 3. Get milestone
    const milestone = await milestonesService.getMilestoneById(milestoneId, supabase);

    // 4. Check project membership
    const isMember = await projectsService.isProjectMember(milestone.project_id, user.id, supabase);

    if (!isMember) {
      return errorResponse("Access denied", 403);
    }

    // 5. Return milestone
    return jsonResponse(milestone);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching milestone:", error);

    if (error instanceof Error && error.message === "Milestone not found") {
      return errorResponse(error.message, 404);
    }

    return errorResponse("Internal server error", 500);
  }
};

/**
 * PATCH /api/milestones/{milestoneId}
 * Updates an existing milestone
 *
 * @requires Authentication - User must be authenticated
 * @requires Authorization - User must be a project manager or administrator
 *
 * @body name - Name of the milestone (optional)
 * @body description - Description of the milestone (optional)
 * @body due_date - Due date for the milestone (optional)
 *
 * @returns 200 - Milestone successfully updated
 * @returns 400 - Invalid input or milestone not found
 * @returns 401 - User not authenticated
 * @returns 403 - User not a project manager
 * @returns 404 - Milestone not found
 * @returns 500 - Internal server error
 */
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    // 1. Check authentication
    const user = locals.user;
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    // 2. Validate params
    const paramsValidation = milestoneIdParamSchema.safeParse(params);
    if (!paramsValidation.success) {
      return errorResponse("Invalid milestone ID", 400);
    }

    const { milestoneId } = paramsValidation.data;
    const supabase = locals.supabase;

    // 3. Get milestone to check project ownership
    const milestone = await milestonesService.getMilestoneById(milestoneId, supabase);

    // 4. Check project manager permissions
    const isManager = await membersService.isProjectManager(milestone.project_id, user.id, supabase);

    if (!isManager) {
      return errorResponse("Access denied", 403);
    }

    // 5. Validate request body
    const body = await request.json();
    const bodyValidation = updateMilestoneSchema.safeParse(body);

    if (!bodyValidation.success) {
      return errorResponse("Invalid input data", 400);
    }

    const command = bodyValidation.data;

    // 6. Update milestone
    const updatedMilestone = await milestonesService.updateMilestone(milestoneId, command, supabase);

    // 7. Return updated milestone
    return jsonResponse(updatedMilestone);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error updating milestone:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message === "Milestone not found") {
        return errorResponse(error.message, 404);
      }
      if (error.message.includes("already exists")) {
        return errorResponse(error.message, 400);
      }
    }

    return errorResponse("Internal server error", 500);
  }
};

/**
 * DELETE /api/milestones/{milestoneId}
 * Deletes a milestone
 *
 * @requires Authentication - User must be authenticated
 * @requires Authorization - User must be a project manager or administrator
 *
 * @returns 204 - Milestone successfully deleted
 * @returns 400 - Invalid milestone ID or milestone has assigned tasks
 * @returns 401 - User not authenticated
 * @returns 403 - User not a project manager
 * @returns 404 - Milestone not found
 * @returns 409 - Milestone has assigned tasks (conflict)
 * @returns 500 - Internal server error
 */
export const DELETE: APIRoute = async ({ params, locals }) => {
  try {
    // 1. Check authentication
    const user = locals.user;
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    // 2. Validate params
    const validation = milestoneIdParamSchema.safeParse(params);
    if (!validation.success) {
      return errorResponse("Invalid milestone ID", 400);
    }

    const { milestoneId } = validation.data;
    const supabase = locals.supabase;

    // 3. Get milestone to check project ownership
    const milestone = await milestonesService.getMilestoneById(milestoneId, supabase);

    // 4. Check project manager permissions
    const isManager = await membersService.isProjectManager(milestone.project_id, user.id, supabase);

    if (!isManager) {
      return errorResponse("Access denied", 403);
    }

    // 5. Check if milestone has assigned tasks
    const taskCount = await milestonesService.countTasksByMilestone(milestoneId, supabase);

    if (taskCount > 0) {
      return errorResponse(
        `Cannot delete milestone with ${taskCount} assigned task(s). Please reassign or delete the tasks first.`,
        409
      );
    }

    // 6. Delete milestone
    await milestonesService.deleteMilestone(milestoneId, supabase);

    // 7. Return success (204 No Content)
    return new Response(null, { status: 204 });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error deleting milestone:", error);

    if (error instanceof Error && error.message === "Milestone not found") {
      return errorResponse(error.message, 404);
    }

    return errorResponse("Internal server error", 500);
  }
};
