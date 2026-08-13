import type { CreateProjectInput, UpdateProjectInput } from "../../../core/types/Project";
import { useCreateProject } from "../../hooks/Project/useCreateProject";
import { useDeleteProject } from "../../hooks/Project/useDeleteProject";
import { useProject } from "../../hooks/Project/useProject";
import { useProjects } from "../../hooks/Project/useProjects";
import { useUpdateProject } from "../../hooks/Project/useUpdateProject";

export const useProjectUseCase = (projectId?: string) => {
  const createProjectMutation = useCreateProject();
  const deleteProjectMutation = useDeleteProject();
  const projectQuery = useProject(projectId);
  const projectsQuery = useProjects();
  const updateProjectMutation = useUpdateProject();

  const createProject = (input: CreateProjectInput) => createProjectMutation.mutateAsync(input);
  const deleteProject = (id: string) => deleteProjectMutation.mutateAsync(id);
  const updateProject = (id: string, input: UpdateProjectInput) =>
    updateProjectMutation.mutateAsync({ input, projectId: id });

  return {
    createProject,
    createProjectError: createProjectMutation.error,
    deleteProject,
    deleteProjectError: deleteProjectMutation.error,
    deletingProjectId: deleteProjectMutation.variables,
    isCreatingProject: createProjectMutation.isPending,
    isDeletingProject: deleteProjectMutation.isPending,
    isLoadingProject: projectQuery.isLoading,
    isLoadingProjects: projectsQuery.isLoading,
    isUpdatingProject: updateProjectMutation.isPending,
    project: projectQuery.data,
    projectError: projectQuery.error,
    projects: projectsQuery.data ?? [],
    projectsError: projectsQuery.error,
    updateProject,
    updateProjectError: updateProjectMutation.error
  };
};
