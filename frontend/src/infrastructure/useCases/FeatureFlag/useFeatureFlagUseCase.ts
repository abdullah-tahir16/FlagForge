import type {
  CreateFeatureFlagInput,
  UpdateEnvironmentFlagConfigInput,
  UpdateFeatureFlagInput
} from "../../../core/types/FeatureFlag";
import { useCreateFeatureFlag } from "../../hooks/FeatureFlag/useCreateFeatureFlag";
import { useDeleteFeatureFlag } from "../../hooks/FeatureFlag/useDeleteFeatureFlag";
import { useFeatureFlag } from "../../hooks/FeatureFlag/useFeatureFlag";
import { useProjectFeatureFlags } from "../../hooks/FeatureFlag/useProjectFeatureFlags";
import { useUpdateEnvironmentFlagConfig } from "../../hooks/FeatureFlag/useUpdateEnvironmentFlagConfig";
import { useUpdateFeatureFlag } from "../../hooks/FeatureFlag/useUpdateFeatureFlag";

export const useFeatureFlagUseCase = (projectId?: string, flagId?: string) => {
  const createFeatureFlagMutation = useCreateFeatureFlag();
  const deleteFeatureFlagMutation = useDeleteFeatureFlag();
  const featureFlagQuery = useFeatureFlag(projectId, flagId);
  const featureFlagsQuery = useProjectFeatureFlags(projectId);
  const updateEnvironmentFlagConfigMutation = useUpdateEnvironmentFlagConfig();
  const updateFeatureFlagMutation = useUpdateFeatureFlag();

  const createFeatureFlag = (id: string, input: CreateFeatureFlagInput) =>
    createFeatureFlagMutation.mutateAsync({ input, projectId: id });
  const deleteFeatureFlag = (id: string, selectedFlagId: string) =>
    deleteFeatureFlagMutation.mutateAsync({ flagId: selectedFlagId, projectId: id });
  const updateEnvironmentFlagConfig = (
    id: string,
    selectedFlagId: string,
    environmentId: string,
    input: UpdateEnvironmentFlagConfigInput
  ) => updateEnvironmentFlagConfigMutation.mutateAsync({ environmentId, flagId: selectedFlagId, input, projectId: id });
  const updateFeatureFlag = (id: string, selectedFlagId: string, input: UpdateFeatureFlagInput) =>
    updateFeatureFlagMutation.mutateAsync({ flagId: selectedFlagId, input, projectId: id });

  return {
    createFeatureFlag,
    createFeatureFlagError: createFeatureFlagMutation.error,
    deleteFeatureFlag,
    deleteFeatureFlagError: deleteFeatureFlagMutation.error,
    deletingFeatureFlagId: deleteFeatureFlagMutation.isPending ? deleteFeatureFlagMutation.variables?.flagId : undefined,
    featureFlag: featureFlagQuery.data,
    featureFlagError: featureFlagQuery.error,
    featureFlags: featureFlagsQuery.data ?? [],
    featureFlagsError: featureFlagsQuery.error,
    isCreatingFeatureFlag: createFeatureFlagMutation.isPending,
    isDeletingFeatureFlag: deleteFeatureFlagMutation.isPending,
    isLoadingFeatureFlag: featureFlagQuery.isLoading,
    isLoadingFeatureFlags: featureFlagsQuery.isLoading,
    isUpdatingEnvironmentFlagConfig: updateEnvironmentFlagConfigMutation.isPending,
    isUpdatingFeatureFlag: updateFeatureFlagMutation.isPending,
    updateEnvironmentFlagConfig,
    updateEnvironmentFlagConfigError: updateEnvironmentFlagConfigMutation.error,
    updatingEnvironmentFlagConfigId: updateEnvironmentFlagConfigMutation.isPending
      ? updateEnvironmentFlagConfigMutation.variables?.environmentId
      : undefined,
    updateFeatureFlag,
    updateFeatureFlagError: updateFeatureFlagMutation.error
  };
};
