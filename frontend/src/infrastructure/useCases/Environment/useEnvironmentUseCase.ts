import type { UpdateEnvironmentInput } from "../../../core/types/Environment";
import { useProjectEnvironments } from "../../hooks/Environment/useProjectEnvironments";
import { useUpdateEnvironment } from "../../hooks/Environment/useUpdateEnvironment";

export const useEnvironmentUseCase = (projectId?: string) => {
  const environmentsQuery = useProjectEnvironments(projectId);
  const updateEnvironmentMutation = useUpdateEnvironment();

  const updateEnvironment = (environmentId: string, input: UpdateEnvironmentInput) =>
    updateEnvironmentMutation.mutateAsync({ environmentId, input, projectId: projectId as string });

  return {
    environments: environmentsQuery.data ?? [],
    environmentsError: environmentsQuery.error,
    isLoadingEnvironments: environmentsQuery.isLoading,
    isUpdatingEnvironment: updateEnvironmentMutation.isPending,
    updateEnvironment,
    updateEnvironmentError: updateEnvironmentMutation.error,
    updatingEnvironmentId: updateEnvironmentMutation.variables?.environmentId
  };
};
