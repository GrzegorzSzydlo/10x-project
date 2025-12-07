import { z } from "zod";

/**
 * Validation schema for creating a new project.
 * Validates the project name with proper length constraints and normalization.
 */
export const createProjectSchema = z.object({
  name: z
    .string()
    .trim() // Remove leading/trailing whitespace
    .min(3, "Project name must be at least 3 characters long")
    .max(120, "Project name must be no longer than 120 characters")
    .transform((name) =>
      // Normalize multiple spaces to single spaces
      name.replace(/\s+/g, " ")
    ),
});

export type CreateProjectRequest = z.infer<typeof createProjectSchema>;
