import type { APIRoute } from "astro";
import { taskIdParamSchema, updateTaskSchema } from "@/api/validation/projects.schemas";
import * as tasksService from "@/api/services/tasks.service";
import * as projectsService from "@/api/services/projects.service";
import { jsonResponse, errorResponse } from "@/api/utils";

export const prerender = false;

/**
 * GET /api/tasks/{taskId}
 * Retrieves detailed information about a specific task
 *
 * @requires Authentication - User must be authenticated
 * @requires Authorization - User must be a member of the task's project
 *
 * @returns 200 - Task details
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

    // 3. Get task details
    const task = await tasksService.getTaskById(taskId, supabase);
    if (!task) {
      return errorResponse("Task not found", 404);
    }

    // 4. Check project membership
    const isMember = await projectsService.isProjectMember(task.project_id, user.id, supabase);

    if (!isMember) {
      return errorResponse("Access denied", 403);
    }

    // 5. Return task details
    return jsonResponse(task);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching task details:", error);
    return errorResponse("Internal server error", 500);
  }
};

/**
 * PATCH /api/tasks/{taskId}
 * Updates a task's details, status, or display order
 *
 * @requires Authentication - User must be authenticated
 * @requires Authorization - User must be a member of the task's project
 *
 * @body title - Title of the task (optional)
 * @body description - Description of the task (optional)
 * @body assignee_id - UUID of the user to assign the task to (optional, nullable)
 * @body milestone_id - UUID of the milestone (optional, nullable)
 * @body due_date - Due date for the task (optional, nullable)
 * @body status - Status of the task (optional)
 * @body display_order - Display order for Kanban board (optional)
 *
 * @returns 200 - Task successfully updated
 * @returns 400 - Invalid input or business rule violation
 * @returns 401 - User not authenticated
 * @returns 403 - User not a member of the task's project
 * @returns 404 - Task not found
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

    // 5. Validate request body
    const body = await request.json();
    const bodyValidation = updateTaskSchema.safeParse(body);

    if (!bodyValidation.success) {
      return errorResponse("Invalid input data", 400);
    }

    const command = bodyValidation.data;

    // 6. Update task
    const updatedTask = await tasksService.updateTask(taskId, command, user.id, supabase);

    // 7. Return updated task
    return jsonResponse(updatedTask);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error updating task:", error);

    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes("Cannot mark parent task")) {
        return errorResponse(error.message, 400);
      }
    }

    return errorResponse("Internal server error", 500);
  }
};
