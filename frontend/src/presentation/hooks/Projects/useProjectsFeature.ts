import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCurrentOrganization } from "../../../infrastructure/hooks/Organization/useCurrentOrganization";
import { useAuthUseCase } from "../../../infrastructure/useCases/Auth/useAuthUseCase";
import { useProjectUseCase } from "../../../infrastructure/useCases/Project/useProjectUseCase";
import { validateWithSchema } from "../Auth/fns";
import { projectFormSchema } from "./data";

export const useProjectsFeature = () => {
  const auth = useAuthUseCase();
  const currentOrganizationQuery = useCurrentOrganization();
  const navigate = useNavigate();
  const [pendingDeleteProjectId, setPendingDeleteProjectId] = useState<string | null>(null);
  const projects = useProjectUseCase();

  const pendingDeleteProject = useMemo(
    () => projects.projects.find((project) => project.id === pendingDeleteProjectId),
    [pendingDeleteProjectId, projects.projects]
  );

  const onCreateProjectSubmit = async (values: Record<string, string>) => {
    const project = await projects.createProject(projectFormSchema.parse(values));
    navigate(`/projects/${project.id}`);
  };

  const onCancelDeleteProject = () => {
    setPendingDeleteProjectId(null);
  };

  const onConfirmDeleteProject = async () => {
    if (!pendingDeleteProjectId) {
      return;
    }

    await projects.deleteProject(pendingDeleteProjectId);
    setPendingDeleteProjectId(null);
  };

  const onRequestDeleteProject = (projectId: string) => {
    setPendingDeleteProjectId(projectId);
  };

  const onLogout = async () => {
    await auth.logout();
    navigate("/login");
  };

  return {
    createErrorMessage: projects.createProjectError ? "Project could not be created." : null,
    createInitialValues: {
      description: "",
      name: ""
    },
    currentOrganization: currentOrganizationQuery.data,
    currentUser: auth.currentUser,
    deleteErrorMessage: projects.deleteProjectError ? "Project could not be deleted." : null,
    deletingProjectId: projects.deletingProjectId,
    isCreatingProject: projects.isCreatingProject,
    isDeletingProject: projects.isDeletingProject,
    isLoadingProjects: projects.isLoadingProjects,
    onCancelDeleteProject,
    onConfirmDeleteProject,
    onCreateProjectSubmit,
    onLogout,
    onRequestDeleteProject,
    pendingDeleteProjectName: pendingDeleteProject?.name ?? null,
    projects: projects.projects,
    projectsErrorMessage: projects.projectsError ? "Projects could not be loaded." : null,
    title: "Projects",
    validateProject: validateWithSchema(projectFormSchema)
  };
};
