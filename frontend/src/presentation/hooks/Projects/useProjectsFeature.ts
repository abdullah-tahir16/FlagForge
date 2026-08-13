import { useNavigate } from "react-router-dom";
import { useCurrentOrganization } from "../../../infrastructure/hooks/Organization/useCurrentOrganization";
import { useAppUseCase } from "../../../infrastructure/useCases/App/useAppUseCase";
import { useAuthUseCase } from "../../../infrastructure/useCases/Auth/useAuthUseCase";
import { useProjectUseCase } from "../../../infrastructure/useCases/Project/useProjectUseCase";
import { validateWithSchema } from "../Auth/fns";
import { projectFormSchema } from "./data";

export const useProjectsFeature = () => {
  const app = useAppUseCase();
  const auth = useAuthUseCase();
  const currentOrganizationQuery = useCurrentOrganization();
  const navigate = useNavigate();
  const projects = useProjectUseCase();

  const onCreateProjectSubmit = async (values: Record<string, string>) => {
    const project = await projects.createProject(projectFormSchema.parse(values));
    navigate(`/projects/${project.id}`);
  };

  const onDeleteProject = async (projectId: string) => {
    if (!window.confirm("Delete this project?")) {
      return;
    }

    await projects.deleteProject(projectId);
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
    onCreateProjectSubmit,
    onDeleteProject,
    onLogout,
    projects: projects.projects,
    projectsErrorMessage: projects.projectsError ? "Projects could not be loaded." : null,
    title: "Projects",
    validateProject: validateWithSchema(projectFormSchema),
    ...app
  };
};
