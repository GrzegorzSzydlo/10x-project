import { useState } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMilestones } from "@/components/hooks/useMilestones";
import { MilestoneCard } from "./MilestoneCard";
import { MilestoneForm } from "./MilestoneForm";
import type { MilestonesListProps } from "./types";
import type { Milestone } from "@/types";

/**
 * Main component for displaying and managing milestones list
 */
export function MilestonesList({ projectId, userRole }: MilestonesListProps) {
  const { milestones, loading, error, refetch } = useMilestones(projectId);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | undefined>(undefined);

  const canEdit = userRole === "administrator" || userRole === "project_manager";

  const handleCreate = () => {
    setEditingMilestone(undefined);
    setIsDialogOpen(true);
  };

  const handleEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setIsDialogOpen(true);
  };

  const handleDelete = async () => {
    // Delete is handled in MilestoneCard via useMilestoneActions
    // After successful delete, refetch the list
    await refetch();
  };

  const handleSuccess = async () => {
    setIsDialogOpen(false);
    setEditingMilestone(undefined);
    await refetch();
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditingMilestone(undefined);
  };

  if (loading) {
    return (
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Milestones</h2>
          <p className="text-muted-foreground">Organize your work around key project goals and deadlines</p>
        </div>
        {canEdit && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Milestone
          </Button>
        )}
      </div>

      {milestones.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground mb-4">No milestones yet</p>
          {canEdit && (
            <Button variant="outline" onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create your first milestone
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {milestones.map((milestone) => (
            <MilestoneCard
              key={milestone.id}
              milestone={milestone}
              canEdit={canEdit}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingMilestone ? "Edit Milestone" : "Create New Milestone"}</DialogTitle>
          </DialogHeader>
          <MilestoneForm
            projectId={projectId}
            milestone={editingMilestone}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
