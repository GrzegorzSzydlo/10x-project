import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createProjectSchema } from "@/api/validation/projects";
import { devLog } from "@/api/utils";
import type { CreateProjectCommand, ProjectDetailsDto } from "@/types";
import { z } from "zod";

interface CreateProjectModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onProjectCreated: (newProject: ProjectDetailsDto) => void;
}

export function CreateProjectModal({ isOpen, onOpenChange, onProjectCreated }: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Client-side validation
  const getValidationError = (name: string): string | null => {
    try {
      createProjectSchema.parse({ name });
      return null;
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return validationError.errors[0]?.message || "Invalid project name";
      }
      return "Invalid project name";
    }
  };

  const validationError = getValidationError(projectName);
  const isFormValid = projectName.trim() && !validationError;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate and normalize the name
      const validatedData = createProjectSchema.parse({ name: projectName });

      const createProjectCommand: CreateProjectCommand = {
        name: validatedData.name,
      };

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createProjectCommand),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          setError(errorData.message || "Invalid project data");
        } else if (response.status === 403) {
          setError("You don't have permission to create projects");
        } else {
          setError("Failed to create project. Please try again.");
        }
        return;
      }

      const newProject: ProjectDetailsDto = await response.json();

      // Reset form state
      setProjectName("");
      setError(null);

      // Close modal and notify parent
      onOpenChange(false);
      onProjectCreated(newProject);
    } catch (error) {
      devLog("error", "Error creating project:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setProjectName("");
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-test-id="create-project-modal">
        <DialogHeader>
          <DialogTitle>Utwórz nowy projekt</DialogTitle>
          <DialogDescription>Wprowadź nazwę nowego projektu. Nazwa musi zawierać od 3 do 120 znaków.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="project-name"
              placeholder="Nazwa projektu"
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                if (error) setError(null); // Clear error on input change
              }}
              disabled={isLoading}
              aria-label="Nazwa projektu"
              aria-describedby={validationError ? "name-error" : undefined}
              data-test-id="project-name-input"
            />
            {validationError && (
              <p id="name-error" className="text-sm text-red-600" role="alert" data-test-id="validation-error">
                {validationError}
              </p>
            )}
          </div>

          {error && (
            <div
              className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md"
              role="alert"
              data-test-id="api-error"
            >
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              data-test-id="cancel-button"
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={!isFormValid || isLoading} data-test-id="submit-button">
              {isLoading ? "Tworzenie..." : "Utwórz"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
