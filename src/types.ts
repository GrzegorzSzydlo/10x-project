import type { Tables, Enums } from "./db/database.types";

/**
 * Base entity types, derived directly from the database schema.
 * These types represent the raw data structure of database tables.
 */
export type User = Tables<"users">;
export type Project = Tables<"projects">;
export type ProjectMember = Tables<"project_members">;
export type Milestone = Tables<"milestones">;
export type Task = Tables<"tasks">;
export type TaskHistory = Tables<"task_history">;
export type UserRole = Enums<"user_role">;
export type TaskStatus = Enums<"task_status">;

/**
 * Data Transfer Objects (DTOs)
 *
 * These types define the shape of data sent from the server to the client.
 * They are derived from the base entity types to ensure consistency with the database,
 * but are tailored to the specific needs of API endpoints, often omitting sensitive
 * or unnecessary fields.
 */

/**
 * Represents the public-facing data for a user.
 * Used in endpoints like `GET /users`.
 */
export type UserDto = Pick<User, "id" | "first_name" | "last_name" | "avatar_url" | "role">;

/**
 * Represents a summary of a project.
 * Used in listings like `GET /projects`.
 */
export type ProjectDto = Pick<Project, "id" | "name" | "owner_id" | "created_at">;

/**
 * Represents the full details of a project.
 * Used in responses for creating or fetching a single project, e.g., `POST /projects` or `GET /projects/{projectId}`.
 */
export type ProjectDetailsDto = Project;

/**
 * Represents a project member's information, combining user details with their role.
 * Used in `GET /projects/{projectId}/members`.
 * This type is a composition of UserDto, omitting the 'id' to use 'user_id' as the primary identifier in this context.
 */
export type ProjectMemberDto = Omit<UserDto, "id"> & {
  user_id: User["id"];
};

/**
 * Represents a milestone within a project.
 * Used in `GET /projects/{projectId}/milestones`.
 */
export type MilestoneDto = Milestone;

/**
 * Represents a task summary, formatted for display on a Kanban board.
 * Used in the grouped response for `GET /projects/{projectId}/tasks`.
 */
export type TaskCardDto = Pick<Task, "id" | "title" | "assignee_id" | "parent_task_id" | "display_order">;

/**
 * Represents the full details of a task.
 * Used in responses for creating a new task, e.g., `POST /projects/{projectId}/tasks`.
 */
export type TaskDetailsDto = Task;

/**
 * Represents a single entry in a task's change history.
 * Used in `GET /tasks/{taskId}/history`.
 */
export type TaskHistoryDto = Pick<
  TaskHistory,
  "id" | "user_id" | "changed_field" | "old_value" | "new_value" | "changed_at"
>;

/**
 * Command Models
 *
 * These types define the shape of data sent from the client to the server for CUD (Create, Update, Delete) operations.
 * They are used as request bodies for POST, PATCH, and PUT requests, ensuring that the client provides
 * all necessary data for the operation while adhering to a strict, validated structure.
 */

/**
 * Command for updating a user's role.
 * Used in `PATCH /users/{userId}/role`.
 */
export type UpdateUserRoleCommand = Pick<User, "role">;

/**
 * Command for creating a new project.
 * Used in `POST /projects`.
 */
export type CreateProjectCommand = Pick<Project, "name">;

/**
 * Command for adding a member to a project.
 * Used in `POST /projects/{projectId}/members`.
 */
export type AddProjectMemberCommand = Pick<ProjectMember, "user_id">;

/**
 * Command for creating a new milestone.
 * Used in `POST /projects/{projectId}/milestones`.
 */
export type CreateMilestoneCommand = Pick<Milestone, "name" | "description" | "due_date">;

/**
 * Command for creating a new task.
 * Used in `POST /projects/{projectId}/tasks`.
 */
export type CreateTaskCommand = Pick<
  Task,
  "title" | "description" | "assignee_id" | "milestone_id" | "parent_task_id" | "due_date"
>;

/**
 * Command for updating an existing task.
 * All fields are optional, allowing for partial updates.
 * Used in `PATCH /tasks/{taskId}`.
 */
export type UpdateTaskCommand = Partial<
  Pick<Task, "title" | "description" | "assignee_id" | "milestone_id" | "due_date" | "status" | "display_order">
>;
