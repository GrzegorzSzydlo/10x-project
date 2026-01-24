import { TaskCard } from "./TaskCard";
import type { TaskCardDto, TaskStatus } from "@/types";

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: TaskCardDto[];
  onTaskClick?: (taskId: string) => void;
}

const STATUS_LABELS: Record<TaskStatus, string> = {
  "To Do": "To Do",
  "In Progress": "In Progress",
  Testing: "Testing",
  Done: "Done",
};

const STATUS_COLORS: Record<TaskStatus, string> = {
  "To Do": "border-gray-300",
  "In Progress": "border-blue-300",
  Testing: "border-yellow-300",
  Done: "border-green-300",
};

export function KanbanColumn({ status, tasks, onTaskClick }: KanbanColumnProps) {
  return (
    <div className="flex flex-col">
      <div className="mb-3">
        <h3 className="font-semibold text-sm text-foreground mb-1">{STATUS_LABELS[status]}</h3>
        <p className="text-xs text-muted-foreground">
          {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
        </p>
      </div>

      <div
        className={`flex-1 rounded-lg border-2 border-dashed ${STATUS_COLORS[status]} bg-muted/40 p-2 min-h-[400px]`}
        role="list"
        aria-label={`${STATUS_LABELS[status]} column`}
      >
        {tasks.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">No tasks</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} onClick={() => onTaskClick?.(task.id)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
