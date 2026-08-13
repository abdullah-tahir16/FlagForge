import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCurrentOrganization } from "../../../infrastructure/hooks/Organization/useCurrentOrganization";
import { useAppUseCase } from "../../../infrastructure/useCases/App/useAppUseCase";
import { useAuthUseCase } from "../../../infrastructure/useCases/Auth/useAuthUseCase";
import { useFeatureFlagUseCase } from "../../../infrastructure/useCases/FeatureFlag/useFeatureFlagUseCase";
import { useProjectUseCase } from "../../../infrastructure/useCases/Project/useProjectUseCase";
import { validateWithSchema } from "../Auth/fns";
import { featureFlagFormSchema } from "./data";

export const useProjectFlagsFeature = () => {
  const app = useAppUseCase();
  const auth = useAuthUseCase();
  const currentOrganizationQuery = useCurrentOrganization();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [pendingDeleteFeatureFlagId, setPendingDeleteFeatureFlagId] = useState<string | null>(null);
  const featureFlags = useFeatureFlagUseCase(projectId);
  const projects = useProjectUseCase(projectId);

  const pendingDeleteFeatureFlag = useMemo(
    () => featureFlags.featureFlags.find((featureFlag) => featureFlag.id === pendingDeleteFeatureFlagId),
    [featureFlags.featureFlags, pendingDeleteFeatureFlagId]
  );

  const onCancelDeleteFeatureFlag = () => {
    setPendingDeleteFeatureFlagId(null);
  };

  const onConfirmDeleteFeatureFlag = async () => {
    if (!projectId || !pendingDeleteFeatureFlagId) {
      return;
    }

    await featureFlags.deleteFeatureFlag(projectId, pendingDeleteFeatureFlagId);
    setPendingDeleteFeatureFlagId(null);
  };

  const onCreateFeatureFlagSubmit = async (values: Record<string, string>) => {
    if (!projectId) {
      return;
    }

    const featureFlag = await featureFlags.createFeatureFlag(projectId, featureFlagFormSchema.parse(values));
    navigate(`/projects/${projectId}/flags/${featureFlag.id}`);
  };

  const onLogout = async () => {
    await auth.logout();
    navigate("/login");
  };

  const onRequestDeleteFeatureFlag = (flagId: string) => {
    setPendingDeleteFeatureFlagId(flagId);
  };

  return {
    createFeatureFlagErrorMessage: featureFlags.createFeatureFlagError ? "Feature flag could not be created." : null,
    createFeatureFlagInitialValues: {
      description: "",
      name: ""
    },
    currentOrganization: currentOrganizationQuery.data,
    currentUser: auth.currentUser,
    deleteFeatureFlagErrorMessage: featureFlags.deleteFeatureFlagError ? "Feature flag could not be deleted." : null,
    deletingFeatureFlagId: featureFlags.deletingFeatureFlagId,
    featureFlags: featureFlags.featureFlags,
    featureFlagsErrorMessage: featureFlags.featureFlagsError ? "Feature flags could not be loaded." : null,
    isCreatingFeatureFlag: featureFlags.isCreatingFeatureFlag,
    isDeletingFeatureFlag: featureFlags.isDeletingFeatureFlag,
    isLoadingFeatureFlags: featureFlags.isLoadingFeatureFlags,
    isLoadingProject: projects.isLoadingProject,
    onCancelDeleteFeatureFlag,
    onConfirmDeleteFeatureFlag,
    onCreateFeatureFlagSubmit,
    onLogout,
    onRequestDeleteFeatureFlag,
    pendingDeleteFeatureFlagName: pendingDeleteFeatureFlag?.name ?? null,
    project: projects.project,
    projectErrorMessage: projects.projectError ? "Project could not be loaded." : null,
    projectId,
    title: projects.project ? `${projects.project.name} flags` : "Project flags",
    validateFeatureFlag: validateWithSchema(featureFlagFormSchema),
    ...app
  };
};
