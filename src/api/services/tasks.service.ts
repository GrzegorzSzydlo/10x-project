import type { SupabaseClient } from "@/db/supabase.client";
import type {
  TaskCardDto,
  TaskDetailsDto,
  KanbanColumns,
  CreateTaskCommand,
  UpdateTaskCommand,
  TaskHistoryDto,
  TaskStatus,
} from "@/types";

/**
 * Retrieves all tasks for a project in Kanban board format
 * Tasks are grouped by status and can be filtered by assignee and milestone
 * @param projectId - UUID of the project
 * @param filters - Optional filters for assignee_id and milestone_id
 * @param supabase - Supabase client instance
 * @returns Tasks organized by status columns
 */
export async function getProjectTasks(
  projectId: string,
  filters: { assignee_id?: string; milestone_id?: string },
  supabase: SupabaseClient
): Promise<KanbanColumns> {
  let query = supabase
    .from("tasks")
    .select(
      `
      id,
      title,
      description,
      assignee_id,
      parent_task_id,
      display_order,
      status,
      users!tasks_assignee_id_fkey(first_name, last_name),
      milestones(name)
    `
    )
    .eq("project_id", projectId)
    .order("display_order", { ascending: true });

  if (filters.assignee_id) {
    query = query.eq("assignee_id", filters.assignee_id);
  }

  if (filters.milestone_id) {
    query = query.eq("milestone_id", filters.milestone_id);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Initialize Kanban columns
  const kanban: KanbanColumns = {
    "To Do": [],
    "In Progress": [],
    Testing: [],
    Done: [],
  };

  // Group tasks by status
  data?.forEach((task: Task) => {
    const { status, users, milestones, ...cardData } = task;
    const assigneeName =
      users?.first_name || users?.last_name ? `${users.first_name || ""} ${users.last_name || ""}`.trim() : undefined;

    const taskCard: TaskCardDto = {
      ...cardData,
      assignee_name: assigneeName,
      milestone_name: milestones?.name,
    };
    kanban[status as TaskStatus].push(taskCard);
  });

  return kanban;
}

/**
 * Creates a new task in a project
 * Automatically assigns display_order as the last task in "To Do" column
 * @param projectId - UUID of the project
 * @param command - Command containing task details
 * @param userId - UUID of the user creating the task (for history tracking)
 * @param supabase - Supabase client instance
 * @returns Created task with all details
 */
export async function createTask(
  projectId: string,
  command: CreateTaskCommand,
  userId: string,
  supabase: SupabaseClient
): Promise<TaskDetailsDto> {
  // Calculate next display_order for "To Do" column
  const { data: lastTask } = await supabase
    .from("tasks")
    .select("display_order")
    .eq("project_id", projectId)
    .eq("status", "To Do")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const display_order = lastTask && lastTask.display_order ? lastTask.display_order + 1 : 1;

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      project_id: projectId,
      title: command.title,
      description: command.description,
      assignee_id: command.assignee_id,
      milestone_id: command.milestone_id,
      parent_task_id: command.parent_task_id,
      due_date: command.due_date,
      status: "To Do",
      display_order,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Updates an existing task
 * Tracks changes in task_history table
 * Enforces business rules (e.g., parent task can't be Done if subtasks are incomplete)
 * @param taskId - UUID of the task to update
 * @param command - Command containing fields to update
 * @param userId - UUID of the user making the update (for history tracking)
 * @param supabase - Supabase client instance
 * @returns Updated task with all details
 * @throws Error if business rules are violated or database error occurs
 */
export async function updateTask(
  taskId: string,
  command: UpdateTaskCommand,
  userId: string,
  supabase: SupabaseClient
): Promise<TaskDetailsDto> {
  // Get current task state for history and validation
  const { data: oldTask } = await supabase.from("tasks").select("*").eq("id", taskId).single();

  if (!oldTask) {
    throw new Error("Task not found");
  }

  // Business rule: Can't move parent task to Done if subtasks are incomplete
  if (command.status === "Done" && oldTask.parent_task_id === null) {
    const { data: subtasks } = await supabase
      .from("tasks")
      .select("id, status")
      .eq("parent_task_id", taskId)
      .neq("status", "Done");

    if (subtasks && subtasks.length > 0) {
      throw new Error("Cannot mark parent task as Done while subtasks are incomplete");
    }
  }

  // Update task
  const { data, error } = await supabase.from("tasks").update(command).eq("id", taskId).select().single();

  if (error) throw error;

  // Record changes in history
  await recordTaskHistory(taskId, oldTask, data, userId, supabase);

  return data;
}

/**
 * Retrieves the change history for a specific task
 * @param taskId - UUID of the task
 * @param supabase - Supabase client instance
 * @returns Array of task history entries, newest first
 */
export async function getTaskHistory(taskId: string, supabase: SupabaseClient): Promise<TaskHistoryDto[]> {
  const { data, error } = await supabase
    .from("task_history")
    .select("id, user_id, changed_field, old_value, new_value, changed_at")
    .eq("task_id", taskId)
    .order("changed_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Retrieves a task by its ID
 * @param taskId - UUID of the task
 * @param supabase - Supabase client instance
 * @returns Task details or null if not found
 */
export async function getTaskById(taskId: string, supabase: SupabaseClient): Promise<TaskDetailsDto | null> {
  const { data, error } = await supabase.from("tasks").select("*").eq("id", taskId).single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }

  return data;
}

/**
 * Records changes to a task in the task_history table
 * Compares old and new task states and creates history entries for changed fields
 * @param taskId - UUID of the task
 * @param oldTask - Previous task state
 * @param newTask - New task state
 * @param userId - UUID of the user who made the changes
 * @param supabase - Supabase client instance
 */
async function recordTaskHistory(
  taskId: string,
  oldTask: TaskDetailsDto,
  newTask: TaskDetailsDto,
  userId: string,
  supabase: SupabaseClient
) {
  const changes: {
    task_id: string;
    user_id: string;
    changed_field: string;
    old_value: string | null;
    new_value: string | null;
  }[] = [];

  // Fields to track in history
  const fieldsToTrack = ["title", "description", "status", "assignee_id", "milestone_id", "due_date", "display_order"];

  fieldsToTrack.forEach((field) => {
    const oldValue = oldTask[field as keyof TaskDetailsDto];
    const newValue = newTask[field as keyof TaskDetailsDto];

    if (oldValue !== newValue) {
      changes.push({
        task_id: taskId,
        user_id: userId,
        changed_field: field,
        old_value: oldValue?.toString() || null,
        new_value: newValue?.toString() || null,
      });
    }
  });

  if (changes.length > 0) {
    const { error } = await supabase.from("task_history").insert(changes);
    if (error) {
      // Log error but don't fail the request
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("Failed to record task history:", error);
      }
    }
  }
}
