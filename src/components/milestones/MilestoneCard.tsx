import { Calendar, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { MilestoneCardProps } from "./types";

/**
 * Component displaying a single milestone card with edit/delete actions
 */
export function MilestoneCard({ milestone, canEdit, onEdit, onDelete }: MilestoneCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "No due date";
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isOverdue = milestone.due_date && new Date(milestone.due_date) < new Date();

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{milestone.name}</CardTitle>
            {milestone.description && (
              <CardDescription className="mt-1.5 line-clamp-2">{milestone.description}</CardDescription>
            )}
          </div>
          {canEdit && (
            <div className="flex gap-2 ml-4">
              <Button variant="ghost" size="sm" onClick={() => onEdit(milestone)} aria-label={`Edit ${milestone.name}`}>
                <Edit className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" aria-label={`Delete ${milestone.name}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the milestone &ldquo;{milestone.name}
                      &rdquo;. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => onDelete(milestone.id)}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span className={isOverdue ? "text-destructive font-medium" : ""}>{formatDate(milestone.due_date)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
