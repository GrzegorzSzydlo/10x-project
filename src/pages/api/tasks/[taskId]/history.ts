import type { APIRoute } from "astro";
import { taskIdParamSchema } from "@/api/validation/projects.schemas";
import * as tasksService from "@/api/services/tasks.service";
import * as projectsService from "@/api/services/projects.service";
import { jsonResponse, errorResponse } from "@/api/utils";

export const prerender = false;

/**
 * GET /api/tasks/{taskId}/history
 * Retrieves the change history for a specific task
 *
 * @requires Authentication - User must be authenticated
 * @requires Authorization - User must be a member of the task's project
 *
 * @returns 200 - Array of task history entries
 * @returns 400 - Invalid task ID format
 * @returns 401 - User not authenticated
 * @returns 403 - User not a member of the task's project
 * @returns 404 - Task not found
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
    const paramsValidation = taskIdParamSchema.safeParse(params);
    if (!paramsValidation.success) {
      return errorResponse("Invalid task ID", 400);
    }

    const { taskId } = paramsValidation.data;
    const supabase = locals.supabase;

    // 3. Get task to verify it exists and get project_id
    const task = await tasksService.getTaskById(taskId, supabase);
    if (!task) {
      return errorResponse("Task not found", 404);
    }

    // 4. Check project membership
    const isMember = await projectsService.isProjectMember(task.project_id, user.id, supabase);

    if (!isMember) {
      return errorResponse("Access denied", 403);
    }

    // 5. Get task history
    const history = await tasksService.getTaskHistory(taskId, supabase);

    // 6. Return history
    return jsonResponse(history);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching task history:", error);
    return errorResponse("Internal server error", 500);
  }
};
