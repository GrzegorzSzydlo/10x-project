import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProjectHeader } from "./ProjectHeader";
import { KanbanBoard } from "./board/KanbanBoard";
import { MilestonesList } from "@/components/milestones/MilestonesList";
import type { ProjectDetailsDto, UserRole } from "@/types";

interface ProjectWorkspaceProps {
  initialProjectData: ProjectDetailsDto;
  userRole: UserRole;
}

export function ProjectWorkspace({ initialProjectData, userRole }: ProjectWorkspaceProps) {
  const [activeTab, setActiveTab] = useState("board");

  return (
    <div className="min-h-screen">
      <ProjectHeader project={initialProjectData} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="board">Kanban</TabsTrigger>
            <TabsTrigger value="milestones">Milestones</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="board" className="mt-6">
            <KanbanBoard projectId={initialProjectData.id} />
          </TabsContent>

          <TabsContent value="milestones" className="mt-6">
            <MilestonesList projectId={initialProjectData.id} userRole={userRole} />
          </TabsContent>

          <TabsContent value="members" className="mt-6">
            <div className="rounded-lg border bg-card p-6">
              <p className="text-muted-foreground">Members list coming soon...</p>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="rounded-lg border bg-card p-6">
              <p className="text-muted-foreground">Project settings coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
