import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProjectCard } from "./ProjectCard";
import { CreateProjectModal } from "./CreateProjectModal";
import type { ProjectDto, ProjectDetailsDto, User } from "@/types";

interface ProjectListProps {
  initialProjects: ProjectDto[];
  user: User;
}

export function ProjectList({ initialProjects, user }: ProjectListProps) {
  const [projects, setProjects] = useState<ProjectDto[]>(initialProjects);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Check if user can create projects (project_manager or administrator)
  const canCreateProjects = user.role === "project_manager" || user.role === "administrator";

  const handleProjectCreated = (newProject: ProjectDetailsDto) => {
    // Convert ProjectDetailsDto to ProjectDto for the list
    const projectDto: ProjectDto = {
      id: newProject.id,
      name: newProject.name,
      owner_id: newProject.owner_id,
      created_at: newProject.created_at,
    };

    // Add new project to the beginning of the list
    setProjects((prevProjects) => [projectDto, ...prevProjects]);
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Moje projekty</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Zarządzaj swoimi projektami i śledź postępy</p>
        </div>

        {canCreateProjects && (
          <Button onClick={handleOpenModal} className="w-full md:w-auto px-6" data-test-id="create-project-button">
            Utwórz nowy projekt
          </Button>
        )}
      </div>

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" data-test-id="projects-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 md:py-12">
          <div className="mx-auto max-w-md px-4">
            <svg
              className="mx-auto h-10 w-10 md:h-12 md:w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
            <h3 className="mt-4 text-base md:text-lg font-medium text-gray-900">Brak projektów</h3>
            <p className="mt-2 text-sm md:text-base text-gray-500">
              {canCreateProjects
                ? "Nie masz jeszcze żadnych projektów. Utwórz swój pierwszy projekt, aby rozpocząć pracę."
                : "Nie należysz jeszcze do żadnego projektu. Poproś kierownika o dodanie Cię do projektu."}
            </p>
            {canCreateProjects && (
              <div className="mt-6">
                <Button
                  onClick={handleOpenModal}
                  className="w-full md:w-auto"
                  data-test-id="create-first-project-button"
                >
                  Utwórz pierwszy projekt
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} onProjectCreated={handleProjectCreated} />
    </div>
  );
}
