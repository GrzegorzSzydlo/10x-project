import type { APIRoute } from "astro";
import { projectIdParamSchema, userIdParamSchema } from "@/api/validation/projects.schemas";
import * as projectsService from "@/api/services/projects.service";
import * as membersService from "@/api/services/members.service";
import { errorResponse } from "@/api/utils";

export const prerender = false;

/**
 * DELETE /api/projects/{projectId}/members/{userId}
 * Removes a user from a project
 *
 * @requires Authentication - User must be authenticated
 * @requires Authorization - User must be a project manager or administrator
 *
 * @returns 204 - Member successfully removed
 * @returns 400 - Invalid project or user ID format
 * @returns 401 - User not authenticated
 * @returns 403 - User not a project manager
 * @returns 404 - Project, user, or membership not found
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
    const projectValidation = projectIdParamSchema.safeParse({
      projectId: params.projectId,
    });
    const userValidation = userIdParamSchema.safeParse({
      userId: params.userId,
    });

    if (!projectValidation.success || !userValidation.success) {
      return errorResponse("Invalid project or user ID", 400);
    }

    const { projectId } = projectValidation.data;
    const { userId } = userValidation.data;
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

    // 5. Verify user exists
    const userExists = await membersService.userExists(userId, supabase);
    if (!userExists) {
      return errorResponse("User not found", 404);
    }

    // 6. Verify membership exists
    const isMember = await projectsService.isProjectMember(projectId, userId, supabase);

    if (!isMember) {
      return errorResponse("Membership not found", 404);
    }

    // 7. Remove member from project
    await membersService.removeProjectMember(projectId, userId, supabase);

    // 8. Return no content
    return new Response(null, { status: 204 });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error removing project member:", error);
    return errorResponse("Internal server error", 500);
  }
};
