import type { Milestone } from "@/types";

/**
 * Props for MilestoneCard component
 */
export interface MilestoneCardProps {
  milestone: Milestone;
  canEdit: boolean;
  onEdit: (milestone: Milestone) => void;
  onDelete: (milestoneId: string) => void;
}

/**
 * Props for MilestoneForm component
 */
export interface MilestoneFormProps {
  projectId: string;
  milestone?: Milestone;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Props for MilestonesList component
 */
export interface MilestonesListProps {
  projectId: string;
  userRole: "administrator" | "project_manager" | "team_member";
}

/**
 * Form values for creating/editing a milestone
 */
export interface MilestoneFormValues {
  name: string;
  description: string;
  due_date: string;
}

/**
 * API response types
 */
export interface CreateMilestoneRequest {
  name: string;
  description?: string;
  due_date?: string;
}

export interface UpdateMilestoneRequest {
  name?: string;
  description?: string;
  due_date?: string;
}
