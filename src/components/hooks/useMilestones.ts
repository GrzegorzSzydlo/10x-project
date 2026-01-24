import { useState, useEffect, useCallback } from "react";
import type { Milestone } from "@/types";

interface UseMilestonesReturn {
  milestones: Milestone[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook for fetching and managing milestones data for a project
 * @param projectId - UUID of the project
 * @returns Object containing milestones array, loading state, error state, and refetch function
 */
export function useMilestones(projectId: string): UseMilestonesReturn {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMilestones = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}/milestones`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch milestones: ${response.status}`);
      }

      const data = await response.json();
      setMilestones(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch milestones";
      setError(errorMessage);
      // eslint-disable-next-line no-console
      console.error("Error fetching milestones:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  return {
    milestones,
    loading,
    error,
    refetch: fetchMilestones,
  };
}
