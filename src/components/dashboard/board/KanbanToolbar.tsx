import { useState } from "react";
import { Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KanbanToolbarProps {
  onAddTask: () => void;
  onFilterChange?: (filters: { assignee_id?: string; milestone_id?: string }) => void;
}

export function KanbanToolbar({ onAddTask }: KanbanToolbarProps) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold">Board</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>

        <Button onClick={onAddTask} size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {showFilters && (
        <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 p-4 border rounded-lg bg-muted/50">
          <select
            className="flex h-9 w-full sm:w-[180px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            defaultValue=""
          >
            <option value="">All Assignees</option>
            {/* TODO: Populate with project members */}
          </select>

          <select
            className="flex h-9 w-full sm:w-[180px] rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            defaultValue=""
          >
            <option value="">All Milestones</option>
            {/* TODO: Populate with project milestones */}
          </select>
        </div>
      )}
    </div>
  );
}
