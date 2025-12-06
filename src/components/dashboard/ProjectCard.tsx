import type { ProjectDto } from "@/types";

interface ProjectCardProps {
  project: ProjectDto;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <a
      href={`/projects/${project.id}`}
      className="block p-6 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 hover:shadow-md transition-all duration-200 hover:border-gray-300"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
      <p className="text-sm text-gray-600">Utworzony: {new Date(project.created_at).toLocaleDateString("pl-PL")}</p>
    </a>
  );
}
