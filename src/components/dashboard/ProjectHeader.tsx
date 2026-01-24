import { Home, ChevronRight } from "lucide-react";
import type { ProjectDetailsDto } from "@/types";

interface ProjectHeaderProps {
  project: ProjectDetailsDto;
}

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <div className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-3" aria-label="Breadcrumb">
          <a href="/" className="hover:text-foreground transition-colors" aria-label="Home">
            <Home className="h-4 w-4" />
          </a>
          <ChevronRight className="h-4 w-4" />
          <a href="/projects" className="hover:text-foreground transition-colors">
            Projekty
          </a>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground font-medium">{project.name}</span>
        </nav>

        {/* Project Title */}
        <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
      </div>
    </div>
  );
}
