import type { KanbanColumns, TaskDetailsDto, CreateTaskCommand, UpdateTaskCommand, TaskHistoryDto } from "@/types";

/**
 * Fetches tasks for a project, grouped by status for Kanban board display
 */
export async function fetchProjectTasks(projectId: string): Promise<KanbanColumns> {
  const response = await fetch(`/api/projects/${projectId}/tasks`);

  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.statusText}`);
  }

  const data = await response.json();
  return data as KanbanColumns;
}

/**
 * Fetches tasks for a project with optional filters
 */
export async function fetchProjectTasksWithFilters(
  projectId: string,
  filters?: {
    assignee_id?: string;
    milestone_id?: string;
  }
): Promise<KanbanColumns> {
  const params = new URLSearchParams();

  if (filters?.assignee_id) {
    params.append("assignee_id", filters.assignee_id);
  }

  if (filters?.milestone_id) {
    params.append("milestone_id", filters.milestone_id);
  }

  const url = `/api/projects/${projectId}/tasks${params.toString() ? `?${params.toString()}` : ""}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch tasks: ${response.statusText}`);
  }

  const data = await response.json();
  return data as KanbanColumns;
}

/**
 * Fetches detailed information about a specific task
 */
export async function fetchTaskDetails(taskId: string): Promise<TaskDetailsDto> {
  const response = await fetch(`/api/tasks/${taskId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch task details");
  }

  const data = await response.json();
  return data as TaskDetailsDto;
}

/**
 * Fetches the history of changes for a specific task
 */
export async function fetchTaskHistory(taskId: string): Promise<TaskHistoryDto[]> {
  const response = await fetch(`/api/tasks/${taskId}/history`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch task history");
  }

  const data = await response.json();
  return data as TaskHistoryDto[];
}

/**
 * Creates a new task in a project
 */
export async function createTask(projectId: string, taskData: CreateTaskCommand): Promise<TaskDetailsDto> {
  const response = await fetch(`/api/projects/${projectId}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create task");
  }

  const data = await response.json();
  return data as TaskDetailsDto;
}

/**
 * Updates an existing task
 */
export async function updateTask(taskId: string, taskData: UpdateTaskCommand): Promise<TaskDetailsDto> {
  const response = await fetch(`/api/tasks/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(taskData),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update task");
  }

  const data = await response.json();
  return data as TaskDetailsDto;
}
