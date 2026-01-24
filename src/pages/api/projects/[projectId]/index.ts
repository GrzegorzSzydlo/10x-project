import type { APIRoute } from "astro";
import { projectIdParamSchema } from "@/api/validation/projects.schemas";
import * as projectsService from "@/api/services/projects.service";
import { jsonResponse, errorResponse } from "@/api/utils";

export const prerender = false;

/**
 * GET /api/projects/{projectId}
 * Retrieves the details of a specific project
 *
 * @requires Authentication - User must be authenticated
 * @requires Authorization - User must be a member of the project
 *
 * @returns 200 - Project details
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

    // 4. Get project
    const project = await projectsService.getProjectById(projectId, supabase);

    if (!project) {
      return errorResponse("Project not found", 404);
    }

    // 5. Return project
    return jsonResponse(project);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching project:", error);
    return errorResponse("Internal server error", 500);
  }
};
