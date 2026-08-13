import { useNavigate, useParams } from "react-router-dom";
import { useCurrentOrganization } from "../../../infrastructure/hooks/Organization/useCurrentOrganization";
import { useAppUseCase } from "../../../infrastructure/useCases/App/useAppUseCase";
import { useAuthUseCase } from "../../../infrastructure/useCases/Auth/useAuthUseCase";
import { useEnvironmentUseCase } from "../../../infrastructure/useCases/Environment/useEnvironmentUseCase";
import { useProjectUseCase } from "../../../infrastructure/useCases/Project/useProjectUseCase";
import { validateWithSchema } from "../Auth/fns";
import { environmentFormSchema, projectFormSchema } from "../Projects/data";

export const useProjectDetailFeature = () => {
  const app = useAppUseCase();
  const auth = useAuthUseCase();
  const currentOrganizationQuery = useCurrentOrganization();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const environments = useEnvironmentUseCase(projectId);
  const projects = useProjectUseCase(projectId);

  const onDeleteProject = async () => {
    if (!projectId || !window.confirm("Delete this project?")) {
      return;
    }

    await projects.deleteProject(projectId);
    navigate("/projects");
  };

  const onEnvironmentSubmit = async (environmentId: string, values: Record<string, string>) => {
    await environments.updateEnvironment(environmentId, environmentFormSchema.parse(values));
  };

  const onLogout = async () => {
    await auth.logout();
    navigate("/login");
  };

  const onProjectSubmit = async (values: Record<string, string>) => {
    if (!projectId) {
      return;
    }

    await projects.updateProject(projectId, projectFormSchema.parse(values));
  };

  return {
    currentOrganization: currentOrganizationQuery.data,
    currentUser: auth.currentUser,
    deleteErrorMessage: projects.deleteProjectError ? "Project could not be deleted." : null,
    environments: environments.environments,
    environmentsErrorMessage: environments.environmentsError ? "Environments could not be loaded." : null,
    environmentValidate: validateWithSchema(environmentFormSchema),
    isDeletingProject: projects.isDeletingProject,
    isLoadingEnvironments: environments.isLoadingEnvironments,
    isLoadingProject: projects.isLoadingProject,
    isUpdatingEnvironment: environments.isUpdatingEnvironment,
    isUpdatingProject: projects.isUpdatingProject,
    onDeleteProject,
    onEnvironmentSubmit,
    onLogout,
    onProjectSubmit,
    project: projects.project,
    projectErrorMessage: projects.projectError ? "Project could not be loaded." : null,
    projectId,
    projectInitialValues: {
      description: projects.project?.description ?? "",
      name: projects.project?.name ?? ""
    },
    projectValidate: validateWithSchema(projectFormSchema),
    title: projects.project?.name ?? "Project",
    updateEnvironmentErrorMessage: environments.updateEnvironmentError ? "Environment could not be updated." : null,
    updateProjectErrorMessage: projects.updateProjectError ? "Project could not be updated." : null,
    updatingEnvironmentId: environments.updatingEnvironmentId,
    ...app
  };
};
