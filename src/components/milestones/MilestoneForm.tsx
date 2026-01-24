import { useEffect } from "react";
import { useForm, type ControllerRenderProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMilestoneActions } from "@/components/hooks/useMilestoneActions";
import type { MilestoneFormProps } from "./types";

const milestoneFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  description: z.string().max(1000, "Description is too long").optional(),
  due_date: z.string().optional(),
});

type MilestoneFormValues = z.infer<typeof milestoneFormSchema>;

/**
 * Form component for creating or editing a milestone
 */
/* eslint-disable react/prop-types */
export function MilestoneForm({ projectId, milestone, onSuccess, onCancel }: MilestoneFormProps) {
  const { createMilestone, updateMilestone, creating, updating, error } = useMilestoneActions(projectId);
  const isEditMode = !!milestone;
  const isSubmitting = creating || updating;

  const form = useForm<MilestoneFormValues>({
    resolver: zodResolver(milestoneFormSchema),
    defaultValues: {
      name: milestone?.name || "",
      description: milestone?.description || "",
      due_date: milestone?.due_date || "",
    },
  });

  useEffect(() => {
    if (milestone) {
      form.reset({
        name: milestone.name,
        description: milestone.description || "",
        due_date: milestone.due_date || "",
      });
    }
  }, [milestone, form]);

  const onSubmit = async (values: MilestoneFormValues) => {
    const data = {
      name: values.name,
      description: values.description || undefined,
      due_date: values.due_date || undefined,
    };

    let result;
    if (isEditMode) {
      result = await updateMilestone(milestone.id, data);
    } else {
      result = await createMilestone(data);
    }

    if (result) {
      form.reset();
      onSuccess();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }: { field: ControllerRenderProps<MilestoneFormValues, "name"> }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Q1 Launch" {...field} />
              </FormControl>
              <FormDescription>A clear, descriptive name for this milestone</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }: { field: ControllerRenderProps<MilestoneFormValues, "description"> }) => (
            <FormItem>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the goals and deliverables for this milestone..."
                  className="resize-none"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="due_date"
          render={({ field }: { field: ControllerRenderProps<MilestoneFormValues, "due_date"> }) => (
            <FormItem>
              <FormLabel>Due Date (optional)</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormDescription>Target completion date for this milestone</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            {error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (isEditMode ? "Updating..." : "Creating...") : isEditMode ? "Update" : "Create"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
