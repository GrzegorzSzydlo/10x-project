import type { APIRoute } from "astro";
import { projectIdParamSchema, createMilestoneSchema } from "@/api/validation/projects.schemas";
import * as projectsService from "@/api/services/projects.service";
import * as membersService from "@/api/services/members.service";
import * as milestonesService from "@/api/services/milestones.service";
import { jsonResponse, errorResponse } from "@/api/utils";

export const prerender = false;

/**
 * GET /api/projects/{projectId}/milestones
 * Retrieves all milestones for a specific project
 *
 * @requires Authentication - User must be authenticated
 * @requires Authorization - User must be a member of the project
 *
 * @returns 200 - Array of milestones
 * @returns 400 - Invalid project ID format
 * @returns 401 - User not authenticated
 * @returns 403 - User not a member of the project
 * @returns 404 - Project not found
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
    const validation = projectIdParamSchema.safeParse(params);
    if (!validation.success) {
      return errorResponse("Invalid project ID", 400);
    }

    const { projectId } = validation.data;
    const supabase = locals.supabase;

    // 3. Check project membership
    const isMember = await projectsService.isProjectMember(projectId, user.id, supabase);

    if (!isMember) {
      return errorResponse("Access denied", 403);
    }

    // 4. Verify project exists
    const project = await projectsService.getProjectById(projectId, supabase);
    if (!project) {
      return errorResponse("Project not found", 404);
    }

    // 5. Get project milestones
    const milestones = await milestonesService.getProjectMilestones(projectId, supabase);

    // 6. Return milestones
    return jsonResponse(milestones);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching project milestones:", error);
    return errorResponse("Internal server error", 500);
  }
};

/**
 * POST /api/projects/{projectId}/milestones
 * Creates a new milestone in a project
 *
 * @requires Authentication - User must be authenticated
 * @requires Authorization - User must be a project manager or administrator
 *
 * @body name - Name of the milestone (required)
 * @body description - Description of the milestone (optional)
 * @body due_date - Due date for the milestone (optional)
 *
 * @returns 201 - Milestone successfully created
 * @returns 400 - Invalid input or milestone name already exists
 * @returns 401 - User not authenticated
 * @returns 403 - User not a project manager
 * @returns 404 - Project not found
 * @returns 500 - Internal server error
 */
export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    // 1. Check authentication
    const user = locals.user;
    if (!user) {
      return errorResponse("Unauthorized", 401);
    }

    // 2. Validate params
    const paramsValidation = projectIdParamSchema.safeParse(params);
    if (!paramsValidation.success) {
      return errorResponse("Invalid project ID", 400);
    }

    const { projectId } = paramsValidation.data;
    const supabase = locals.supabase;

    // 3. Check project manager permissions
    const isManager = await membersService.isProjectManager(projectId, user.id, supabase);

    if (!isManager) {
      return errorResponse("Access denied", 403);
    }

    // 4. Verify project exists
    const project = await projectsService.getProjectById(projectId, supabase);
    if (!project) {
      return errorResponse("Project not found", 404);
    }

    // 5. Validate request body
    const body = await request.json();
    const bodyValidation = createMilestoneSchema.safeParse(body);

    if (!bodyValidation.success) {
      return errorResponse("Invalid input data", 400);
    }

    const command = bodyValidation.data;

    // 6. Create milestone
    const milestone = await milestonesService.createMilestone(projectId, command, supabase);

    // 7. Return created milestone
    return jsonResponse(milestone, 201);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating milestone:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("already exists")) {
        return errorResponse(error.message, 400);
      }
    }

    return errorResponse("Internal server error", 500);
  }
};
