import { z } from "zod";

/**
 * Schema for validating projectId path parameter
 */
export const projectIdParamSchema = z.object({
  projectId: z.string().uuid("Invalid project ID format"),
});

/**
 * Schema for validating userId path parameter
 */
export const userIdParamSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
});

/**
 * Schema for validating taskId path parameter
 */
export const taskIdParamSchema = z.object({
  taskId: z.string().uuid("Invalid task ID format"),
});

/**
 * Schema for validating milestoneId path parameter
 */
export const milestoneIdParamSchema = z.object({
  milestoneId: z.string().uuid("Invalid milestone ID format"),
});

/**
 * Schema for adding a project member
 */
export const addProjectMemberSchema = z.object({
  user_id: z.string().uuid("Invalid user ID format"),
});

/**
 * Schema for creating a milestone
 */
export const createMilestoneSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  description: z.string().optional(),
  due_date: z
    .string()
    .optional()
    .nullable()
    .transform((val) => {
      if (!val || val === null) return undefined;
      // If it's just a date (YYYY-MM-DD), convert to ISO datetime
      if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
        return `${val}T00:00:00Z`;
      }
      return val;
    })
    .pipe(z.string().datetime("Invalid date format").optional()),
});

/**
 * Schema for updating a milestone
 */
export const updateMilestoneSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(255, "Name is too long").optional(),
    description: z.string().max(1000, "Description is too long").optional().nullable(),
    due_date: z
      .string()
      .optional()
      .nullable()
      .transform((val) => {
        if (!val || val === null) return undefined;
        // If it's just a date (YYYY-MM-DD), convert to ISO datetime
        if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
          return `${val}T00:00:00Z`;
        }
        return val;
      })
      .pipe(z.string().datetime("Invalid date format").optional()),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

/**
 * Schema for creating a task
 */
export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title is too long"),
  description: z.string().optional(),
  assignee_id: z
    .string()
    .uuid("Invalid assignee ID format")
    .optional()
    .nullable()
    .transform((val) => (val === null ? undefined : val)),
  milestone_id: z
    .string()
    .uuid("Invalid milestone ID format")
    .optional()
    .nullable()
    .transform((val) => (val === null ? undefined : val)),
  parent_task_id: z
    .string()
    .uuid("Invalid parent task ID format")
    .optional()
    .nullable()
    .transform((val) => (val === null ? undefined : val)),
  due_date: z
    .string()
    .datetime("Invalid due date format")
    .optional()
    .nullable()
    .transform((val) => (val === null ? undefined : val)),
});

/**
 * Schema for updating a task
 */
export const updateTaskSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").max(255, "Title is too long").optional(),
  description: z.string().optional().nullable(),
  assignee_id: z.string().uuid("Invalid assignee ID format").optional().nullable(),
  milestone_id: z.string().uuid("Invalid milestone ID format").optional().nullable(),
  due_date: z
    .string()
    .refine(
      (val) => {
        // Accept both date (YYYY-MM-DD) and datetime (ISO 8601) formats
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        const datetimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?$/;
        return dateRegex.test(val) || datetimeRegex.test(val) || !isNaN(Date.parse(val));
      },
      { message: "Invalid due date format" }
    )
    .optional()
    .nullable(),
  status: z.enum(["To Do", "In Progress", "Testing", "Done"]).optional(),
  display_order: z.number().optional(),
});

/**
 * Schema for validating query parameters for tasks listing
 */
export const tasksQuerySchema = z.object({
  assignee_id: z.string().uuid("Invalid assignee ID format").optional(),
  milestone_id: z.string().uuid("Invalid milestone ID format").optional(),
});
