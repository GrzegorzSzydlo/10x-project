import { useState, useCallback } from "react";
import type { Milestone } from "@/types";
import type { CreateMilestoneRequest, UpdateMilestoneRequest } from "@/components/milestones/types";

interface UseMilestoneActionsReturn {
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  error: string | null;
  createMilestone: (data: CreateMilestoneRequest) => Promise<Milestone | null>;
  updateMilestone: (id: string, data: UpdateMilestoneRequest) => Promise<Milestone | null>;
  deleteMilestone: (id: string) => Promise<boolean>;
}

/**
 * Hook for performing CRUD operations on milestones
 * @param projectId - UUID of the project
 * @returns Object containing action functions and their loading/error states
 */
export function useMilestoneActions(projectId: string): UseMilestoneActionsReturn {
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createMilestone = useCallback(
    async (data: CreateMilestoneRequest): Promise<Milestone | null> => {
      try {
        setCreating(true);
        setError(null);

        const response = await fetch(`/api/projects/${projectId}/milestones`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to create milestone: ${response.status}`);
        }

        const milestone = await response.json();
        return milestone;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to create milestone";
        setError(errorMessage);
        // eslint-disable-next-line no-console
        console.error("Error creating milestone:", err);
        return null;
      } finally {
        setCreating(false);
      }
    },
    [projectId]
  );

  const updateMilestone = useCallback(async (id: string, data: UpdateMilestoneRequest): Promise<Milestone | null> => {
    try {
      setUpdating(true);
      setError(null);

      const response = await fetch(`/api/milestones/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update milestone: ${response.status}`);
      }

      const milestone = await response.json();
      return milestone;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update milestone";
      setError(errorMessage);
      // eslint-disable-next-line no-console
      console.error("Error updating milestone:", err);
      return null;
    } finally {
      setUpdating(false);
    }
  }, []);

  const deleteMilestone = useCallback(async (id: string): Promise<boolean> => {
    try {
      setDeleting(true);
      setError(null);

      const response = await fetch(`/api/milestones/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete milestone: ${response.status}`);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete milestone";
      setError(errorMessage);
      // eslint-disable-next-line no-console
      console.error("Error deleting milestone:", err);
      return false;
    } finally {
      setDeleting(false);
    }
  }, []);

  return {
    creating,
    updating,
    deleting,
    error,
    createMilestone,
    updateMilestone,
    deleteMilestone,
  };
}
