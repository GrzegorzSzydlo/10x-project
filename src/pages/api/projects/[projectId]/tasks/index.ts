import type { APIRoute } from "astro";
import { projectIdParamSchema, tasksQuerySchema, createTaskSchema } from "@/api/validation/projects.schemas";
import * as projectsService from "@/api/services/projects.service";
import * as tasksService from "@/api/services/tasks.service";
import { jsonResponse, errorResponse } from "@/api/utils";

export const prerender = false;

/**
 * GET /api/projects/{projectId}/tasks
 * Retrieves all tasks for a project, formatted for the Kanban board
 *
 * @requires Authentication - User must be authenticated
 * @requires Authorization - User must be a member of the project
 *
 * @query assignee_id - Optional UUID to filter tasks by assignee
 * @query milestone_id - Optional UUID to filter tasks by milestone
 *
 * @returns 200 - Tasks organized by status columns
 * @returns 400 - Invalid project ID or query parameters format
 * @returns 401 - User not authenticated
 * @returns 403 - User not a member of the project
 * @returns 404 - Project not found
 * @returns 500 - Internal server error
 */
export const GET: APIRoute = async ({ params, url, locals }) => {
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

    // 3. Validate query parameters
    const queryParams = {
      assignee_id: url.searchParams.get("assignee_id") || undefined,
      milestone_id: url.searchParams.get("milestone_id") || undefined,
    };

    const queryValidation = tasksQuerySchema.safeParse(queryParams);
    if (!queryValidation.success) {
      return errorResponse("Invalid query parameters", 400);
    }

    const filters = queryValidation.data;
    const supabase = locals.supabase;

    // 4. Check project membership
    const isMember = await projectsService.isProjectMember(projectId, user.id, supabase);

    if (!isMember) {
      return errorResponse("Access denied", 403);
    }

    // 5. Verify project exists
    const project = await projectsService.getProjectById(projectId, supabase);
    if (!project) {
      return errorResponse("Project not found", 404);
    }

    // 6. Get project tasks in Kanban format
    const kanban = await tasksService.getProjectTasks(projectId, filters, supabase);

    // 7. Return tasks
    return jsonResponse(kanban);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching project tasks:", error);
    return errorResponse("Internal server error", 500);
  }
};

/**
 * POST /api/projects/{projectId}/tasks
 * Creates a new task or subtask in a project
 *
 * @requires Authentication - User must be authenticated
 * @requires Authorization - User must be a member of the project
 *
 * @body title - Title of the task (required)
 * @body description - Description of the task (optional)
 * @body assignee_id - UUID of the user to assign the task to (optional)
 * @body milestone_id - UUID of the milestone to associate the task with (optional)
 * @body parent_task_id - UUID of the parent task for subtasks (optional)
 * @body due_date - Due date for the task (optional)
 *
 * @returns 201 - Task successfully created
 * @returns 400 - Invalid input data
 * @returns 401 - User not authenticated
 * @returns 403 - User not a member of the project
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

    // 5. Validate request body
    const body = await request.json();
    const bodyValidation = createTaskSchema.safeParse(body);

    if (!bodyValidation.success) {
      return errorResponse("Invalid input data", 400);
    }

    const command = bodyValidation.data;

    // 6. Create task
    const task = await tasksService.createTask(projectId, command, user.id, supabase);

    // 7. Return created task
    return jsonResponse(task, 201);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating task:", error);
    return errorResponse("Internal server error", 500);
  }
};
