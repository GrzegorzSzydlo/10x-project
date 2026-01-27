import { useState, useEffect, useCallback } from "react";
import { fetchProjectTasksWithFilters, updateTask } from "@/lib/api/tasks";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanToolbar } from "./KanbanToolbar";
import { CreateTaskDialog } from "./CreateTaskDialog";
import { TaskDetailsSheet } from "./TaskDetailsSheet";
import type { KanbanColumns, TaskStatus } from "@/types";

interface KanbanBoardProps {
  projectId: string;
}

const TASK_STATUSES: TaskStatus[] = ["To Do", "In Progress", "Testing", "Done"];

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<KanbanColumns | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchProjectTasksWithFilters(projectId);
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
  };

  const handleAddTask = () => {
    setIsCreateDialogOpen(true);
  };

  const handleTaskCreated = () => {
    // Reload tasks after creating a new one
    loadTasks();
  };

  const handleTaskUpdated = () => {
    // Reload tasks after updating a task
    loadTasks();
  };

  const handleFilterChange = () => {
    // TODO: Implement filtering
  };

  // Obsługa drag & drop: zapamiętaj przeciągane zadanie
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);

  // Funkcja do obsługi upuszczenia zadania do nowej kolumny
  const handleTaskDrop = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task status");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-muted-foreground">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <KanbanToolbar onAddTask={handleAddTask} onFilterChange={handleFilterChange} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {TASK_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasks?.[status] || []}
            onTaskClick={handleTaskClick}
            onTaskDrop={handleTaskDrop}
            draggedTaskId={draggedTaskId}
            setDraggedTaskId={setDraggedTaskId}
          />
        ))}
      </div>

      <CreateTaskDialog
        projectId={projectId}
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onTaskCreated={handleTaskCreated}
      />

      <TaskDetailsSheet
        taskId={selectedTaskId}
        open={!!selectedTaskId}
        onOpenChange={(open) => !open && setSelectedTaskId(null)}
        onTaskUpdated={handleTaskUpdated}
      />
    </div>
  );
}
