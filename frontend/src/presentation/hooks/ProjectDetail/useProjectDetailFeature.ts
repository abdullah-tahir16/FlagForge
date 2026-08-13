import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCurrentOrganization } from "../../../infrastructure/hooks/Organization/useCurrentOrganization";
import { useAppUseCase } from "../../../infrastructure/useCases/App/useAppUseCase";
import { useAuthUseCase } from "../../../infrastructure/useCases/Auth/useAuthUseCase";
import { useEnvironmentUseCase } from "../../../infrastructure/useCases/Environment/useEnvironmentUseCase";
import { useProjectUseCase } from "../../../infrastructure/useCases/Project/useProjectUseCase";
import { useSdkKeyUseCase } from "../../../infrastructure/useCases/SdkKey/useSdkKeyUseCase";
import type { SdkKey } from "../../../core/types/SdkKey";
import { validateWithSchema } from "../Auth/fns";
import { environmentFormSchema, projectFormSchema } from "../Projects/data";
import { sdkKeyFormSchema } from "../SdkKeys/data";

export const useProjectDetailFeature = () => {
  const app = useAppUseCase();
  const auth = useAuthUseCase();
  const currentOrganizationQuery = useCurrentOrganization();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRevokeSdkKeyDialogOpen, setIsRevokeSdkKeyDialogOpen] = useState(false);
  const [selectedSdkKeyEnvironmentId, setSelectedSdkKeyEnvironmentId] = useState<string | undefined>();
  const [selectedRevokeSdkKey, setSelectedRevokeSdkKey] = useState<SdkKey | undefined>();
  const [copiedCreatedSdkKey, setCopiedCreatedSdkKey] = useState(false);
  const environments = useEnvironmentUseCase(projectId);
  const projects = useProjectUseCase(projectId);
  const effectiveSelectedEnvironmentId = selectedSdkKeyEnvironmentId ?? environments.environments[0]?.id;
  const sdkKeys = useSdkKeyUseCase(projectId, effectiveSelectedEnvironmentId);
  const selectedSdkKeyEnvironment = environments.environments.find(
    (environment) => environment.id === effectiveSelectedEnvironmentId
  );

  const onCancelDeleteProject = () => {
    setIsDeleteDialogOpen(false);
  };

  const onConfirmDeleteProject = async () => {
    if (!projectId) {
      return;
    }

    await projects.deleteProject(projectId);
    setIsDeleteDialogOpen(false);
    navigate("/projects");
  };

  const onCancelRevokeSdkKey = () => {
    setIsRevokeSdkKeyDialogOpen(false);
    setSelectedRevokeSdkKey(undefined);
  };

  const onConfirmRevokeSdkKey = async () => {
    if (!selectedRevokeSdkKey) {
      return;
    }

    await sdkKeys.revokeSdkKey(selectedRevokeSdkKey.id);
    setIsRevokeSdkKeyDialogOpen(false);
    setSelectedRevokeSdkKey(undefined);
  };

  const onCopyCreatedSdkKey = async () => {
    if (!sdkKeys.createdSdkKey?.key) {
      return;
    }

    await navigator.clipboard.writeText(sdkKeys.createdSdkKey.key);
    setCopiedCreatedSdkKey(true);
  };

  const onEnvironmentSubmit = async (environmentId: string, values: Record<string, string>) => {
    await environments.updateEnvironment(environmentId, environmentFormSchema.parse(values));
  };

  const onLogout = async () => {
    await auth.logout();
    navigate("/login");
  };

  const onRequestDeleteProject = () => {
    setIsDeleteDialogOpen(true);
  };

  const onRequestRevokeSdkKey = (sdkKey: SdkKey) => {
    setSelectedRevokeSdkKey(sdkKey);
    setIsRevokeSdkKeyDialogOpen(true);
  };

  const onSelectSdkKeyEnvironment = (environmentId: string) => {
    setSelectedSdkKeyEnvironmentId(environmentId);
    setCopiedCreatedSdkKey(false);
  };

  const onProjectSubmit = async (values: Record<string, string>) => {
    if (!projectId) {
      return;
    }

    await projects.updateProject(projectId, projectFormSchema.parse(values));
  };

  const onSdkKeySubmit = async (values: Record<string, string>) => {
    await sdkKeys.createSdkKey(sdkKeyFormSchema.parse(values));
    setCopiedCreatedSdkKey(false);
  };

  return {
    copiedCreatedSdkKey,
    createSdkKeyErrorMessage: sdkKeys.createSdkKeyError ? "SDK key could not be created." : null,
    createdSdkKey: sdkKeys.createdSdkKey,
    currentOrganization: currentOrganizationQuery.data,
    currentUser: auth.currentUser,
    deleteErrorMessage: projects.deleteProjectError ? "Project could not be deleted." : null,
    environments: environments.environments,
    environmentsErrorMessage: environments.environmentsError ? "Environments could not be loaded." : null,
    environmentValidate: validateWithSchema(environmentFormSchema),
    isDeletingProject: projects.isDeletingProject,
    isCreatingSdkKey: sdkKeys.isCreatingSdkKey,
    isLoadingEnvironments: environments.isLoadingEnvironments,
    isLoadingProject: projects.isLoadingProject,
    isLoadingSdkKeys: sdkKeys.isLoadingSdkKeys,
    isRevokeSdkKeyDialogOpen,
    isRevokingSdkKey: sdkKeys.isRevokingSdkKey,
    isUpdatingEnvironment: environments.isUpdatingEnvironment,
    isUpdatingProject: projects.isUpdatingProject,
    isDeleteDialogOpen,
    onCancelDeleteProject,
    onCancelRevokeSdkKey,
    onConfirmDeleteProject,
    onConfirmRevokeSdkKey,
    onCopyCreatedSdkKey,
    onEnvironmentSubmit,
    onLogout,
    onProjectSubmit,
    onRequestDeleteProject,
    onRequestRevokeSdkKey,
    onSdkKeySubmit,
    onSelectSdkKeyEnvironment,
    project: projects.project,
    projectErrorMessage: projects.projectError ? "Project could not be loaded." : null,
    projectId,
    projectInitialValues: {
      description: projects.project?.description ?? "",
      name: projects.project?.name ?? ""
    },
    projectValidate: validateWithSchema(projectFormSchema),
    revokeSdkKeyErrorMessage: sdkKeys.revokeSdkKeyError ? "SDK key could not be revoked." : null,
    revokingSdkKeyId: sdkKeys.revokingSdkKeyId,
    sdkKeyValidate: validateWithSchema(sdkKeyFormSchema),
    sdkKeys: sdkKeys.sdkKeys,
    sdkKeysErrorMessage: sdkKeys.sdkKeysError ? "SDK keys could not be loaded." : null,
    selectedRevokeSdkKey,
    selectedSdkKeyEnvironment,
    selectedSdkKeyEnvironmentId: effectiveSelectedEnvironmentId,
    title: projects.project?.name ?? "Project",
    updateEnvironmentErrorMessage: environments.updateEnvironmentError ? "Environment could not be updated." : null,
    updateProjectErrorMessage: projects.updateProjectError ? "Project could not be updated." : null,
    updatingEnvironmentId: environments.updatingEnvironmentId,
    ...app
  };
};
