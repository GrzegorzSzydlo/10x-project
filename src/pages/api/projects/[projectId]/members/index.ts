import type { APIRoute } from "astro";
import { projectIdParamSchema, addProjectMemberSchema } from "@/api/validation/projects.schemas";
import * as projectsService from "@/api/services/projects.service";
import * as membersService from "@/api/services/members.service";
import { jsonResponse, errorResponse } from "@/api/utils";

export const prerender = false;

/**
 * GET /api/projects/{projectId}/members
 * Retrieves a list of members for a specific project
 *
 * @requires Authentication - User must be authenticated
 * @requires Authorization - User must be a member of the project
 *
 * @returns 200 - Array of project members
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

    // 5. Get project members
    const members = await membersService.getProjectMembers(projectId, supabase);

    // 6. Return members
    return jsonResponse(members);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching project members:", error);
    return errorResponse("Internal server error", 500);
  }
};

/**
 * POST /api/projects/{projectId}/members
 * Adds a user to a project
 *
 * @requires Authentication - User must be authenticated
 * @requires Authorization - User must be a project manager or administrator
 *
 * @body user_id - UUID of the user to add to the project
 *
 * @returns 201 - Member successfully added
 * @returns 400 - Invalid input or user already a member
 * @returns 401 - User not authenticated
 * @returns 403 - User not a project manager
 * @returns 404 - Project or user not found
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
    const bodyValidation = addProjectMemberSchema.safeParse(body);

    if (!bodyValidation.success) {
      return errorResponse("Invalid input data", 400);
    }

    const command = bodyValidation.data;

    // 6. Verify user exists
    const userExists = await membersService.userExists(command.user_id, supabase);

    if (!userExists) {
      return errorResponse("User not found", 404);
    }

    // 7. Add member to project
    const member = await membersService.addProjectMember(projectId, command, supabase);

    // 8. Return created member
    return jsonResponse(member, 201);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error adding project member:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("already a member")) {
        return errorResponse(error.message, 400);
      }
    }

    return errorResponse("Internal server error", 500);
  }
};
