import { useState, useEffect, useCallback } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fetchTaskDetails, fetchTaskHistory, updateTask } from "@/lib/api/tasks";
import type { TaskDetailsDto, TaskHistoryDto, UpdateTaskCommand } from "@/types";

interface TaskDetailsSheetProps {
  taskId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskUpdated?: () => void;
}

export function TaskDetailsSheet({ taskId, open, onOpenChange, onTaskUpdated }: TaskDetailsSheetProps) {
  const [task, setTask] = useState<TaskDetailsDto | null>(null);
  const [history, setHistory] = useState<TaskHistoryDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateTaskCommand>({});

  const loadTaskData = useCallback(async () => {
    if (!taskId) return;

    try {
      setIsLoading(true);
      setError(null);

      const [taskData, historyData] = await Promise.all([fetchTaskDetails(taskId), fetchTaskHistory(taskId)]);

      setTask(taskData);
      setHistory(historyData);

      // Convert due_date to YYYY-MM-DD format for input type="date"
      let formattedDueDate: string | undefined = undefined;
      if (taskData.due_date) {
        const date = new Date(taskData.due_date);
        formattedDueDate = date.toISOString().split("T")[0];
      }

      setFormData({
        title: taskData.title,
        description: taskData.description || "",
        due_date: formattedDueDate,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load task data");
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (open && taskId) {
      loadTaskData();
    }
  }, [open, taskId, loadTaskData]);

  const handleSave = async () => {
    if (!taskId) return;

    try {
      setIsSaving(true);
      setError(null);

      await updateTask(taskId, formData);

      // Reload task data
      await loadTaskData();
      onTaskUpdated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!isSaving) {
      onOpenChange(newOpen);
      if (!newOpen) {
        // Reset state when closing
        setTask(null);
        setHistory([]);
        setFormData({});
        setError(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="sm:max-w-[600px] overflow-y-auto p-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
          </div>
        )}

        {error && (
          <div className="mb-4 p-4 border border-destructive bg-destructive/10 rounded-lg">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {!isLoading && task && (
          <>
            <SheetHeader className="mb-6">
              <SheetTitle>Task Details</SheetTitle>
              <SheetDescription>View and edit task information</SheetDescription>
            </SheetHeader>

            <Tabs defaultValue="details" className="space-y-4">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-5 mt-4 px-1">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Title <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title || ""}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={isSaving}
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date || ""}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value || undefined })}
                    disabled={isSaving}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="text-sm font-medium">{task.status}</div>
                  </div>

                  <div className="space-y-2">
                    <Label>Created</Label>
                    <div className="text-sm text-muted-foreground">{formatDate(task.created_at)}</div>
                  </div>
                </div>

                {task.milestone_id && (
                  <div className="space-y-2">
                    <Label>Milestone</Label>
                    <div className="text-sm font-medium">Milestone ID: {task.milestone_id}</div>
                  </div>
                )}

                {task.assignee_id && (
                  <div className="space-y-2">
                    <Label>Assigned To</Label>
                    <div className="text-sm font-medium">User ID: {task.assignee_id}</div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSave} disabled={isSaving || !formData.title?.trim()}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isSaving}>
                    Cancel
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-4 px-1">
                {history.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No history available</p>
                ) : (
                  <div className="space-y-3">
                    {history.map((entry) => (
                      <div key={entry.id} className="border-l-2 border-primary/30 pl-4 py-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{entry.changed_field} changed</p>
                            {entry.old_value && (
                              <p className="text-xs text-muted-foreground mt-1">
                                From: <span className="font-mono">{entry.old_value}</span>
                              </p>
                            )}
                            {entry.new_value && (
                              <p className="text-xs text-muted-foreground mt-1">
                                To: <span className="font-mono">{entry.new_value}</span>
                              </p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs text-muted-foreground">{formatDate(entry.changed_at)}</p>
                            <p className="text-xs text-muted-foreground mt-1">by {entry.user_id}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
