import { useNavigate, useParams } from "react-router-dom";
import { useCurrentOrganization } from "../../../infrastructure/hooks/Organization/useCurrentOrganization";
import { useAppUseCase } from "../../../infrastructure/useCases/App/useAppUseCase";
import { useAuthUseCase } from "../../../infrastructure/useCases/Auth/useAuthUseCase";
import { useFeatureFlagUseCase } from "../../../infrastructure/useCases/FeatureFlag/useFeatureFlagUseCase";
import { useProjectUseCase } from "../../../infrastructure/useCases/Project/useProjectUseCase";
import { validateWithSchema } from "../Auth/fns";
import { environmentFlagConfigSchema, featureFlagFormSchema } from "../ProjectFlags/data";

export const useFeatureFlagDetailFeature = () => {
  const app = useAppUseCase();
  const auth = useAuthUseCase();
  const currentOrganizationQuery = useCurrentOrganization();
  const navigate = useNavigate();
  const { flagId, projectId } = useParams<{ flagId: string; projectId: string }>();
  const featureFlags = useFeatureFlagUseCase(projectId, flagId);
  const projects = useProjectUseCase(projectId);

  const onEnvironmentConfigSubmit = async (environmentId: string, values: Record<string, unknown>) => {
    if (!projectId || !flagId) {
      return;
    }

    await featureFlags.updateEnvironmentFlagConfig(
      projectId,
      flagId,
      environmentId,
      environmentFlagConfigSchema.parse(values)
    );
  };

  const onFeatureFlagSubmit = async (values: Record<string, string>) => {
    if (!projectId || !flagId) {
      return;
    }

    await featureFlags.updateFeatureFlag(projectId, flagId, featureFlagFormSchema.parse(values));
  };

  const onLogout = async () => {
    await auth.logout();
    navigate("/login");
  };

  return {
    currentOrganization: currentOrganizationQuery.data,
    currentUser: auth.currentUser,
    environmentConfigValidate: validateWithSchema(environmentFlagConfigSchema),
    featureFlag: featureFlags.featureFlag,
    featureFlagErrorMessage: featureFlags.featureFlagError ? "Feature flag could not be loaded." : null,
    featureFlagInitialValues: {
      description: featureFlags.featureFlag?.description ?? "",
      name: featureFlags.featureFlag?.name ?? ""
    },
    featureFlagValidate: validateWithSchema(featureFlagFormSchema),
    isLoadingFeatureFlag: featureFlags.isLoadingFeatureFlag,
    isLoadingProject: projects.isLoadingProject,
    isUpdatingEnvironmentFlagConfig: featureFlags.isUpdatingEnvironmentFlagConfig,
    isUpdatingFeatureFlag: featureFlags.isUpdatingFeatureFlag,
    onEnvironmentConfigSubmit,
    onFeatureFlagSubmit,
    onLogout,
    project: projects.project,
    projectErrorMessage: projects.projectError ? "Project could not be loaded." : null,
    projectId,
    title: featureFlags.featureFlag?.name ?? "Feature flag",
    updateEnvironmentConfigErrorMessage: featureFlags.updateEnvironmentFlagConfigError
      ? "Environment configuration could not be saved."
      : null,
    updateFeatureFlagErrorMessage: featureFlags.updateFeatureFlagError ? "Feature flag could not be saved." : null,
    updatingEnvironmentFlagConfigId: featureFlags.updatingEnvironmentFlagConfigId,
    ...app
  };
};
