import type { CreateSdkKeyInput } from "../../../core/types/SdkKey";
import { useCreateSdkKey } from "../../hooks/SdkKey/useCreateSdkKey";
import { useEnvironmentSdkKeys } from "../../hooks/SdkKey/useEnvironmentSdkKeys";
import { useRevokeSdkKey } from "../../hooks/SdkKey/useRevokeSdkKey";

export const useSdkKeyUseCase = (projectId?: string, environmentId?: string) => {
  const createSdkKeyMutation = useCreateSdkKey();
  const revokeSdkKeyMutation = useRevokeSdkKey();
  const sdkKeysQuery = useEnvironmentSdkKeys(projectId, environmentId);

  const createSdkKey = (input: CreateSdkKeyInput) =>
    createSdkKeyMutation.mutateAsync({
      environmentId: environmentId as string,
      input,
      projectId: projectId as string
    });
  const revokeSdkKey = (sdkKeyId: string) =>
    revokeSdkKeyMutation.mutateAsync({
      environmentId: environmentId as string,
      projectId: projectId as string,
      sdkKeyId
    });

  return {
    createdSdkKey: createSdkKeyMutation.data,
    createSdkKey,
    createSdkKeyError: createSdkKeyMutation.error,
    isCreatingSdkKey: createSdkKeyMutation.isPending,
    isLoadingSdkKeys: sdkKeysQuery.isLoading,
    isRevokingSdkKey: revokeSdkKeyMutation.isPending,
    revokeSdkKey,
    revokeSdkKeyError: revokeSdkKeyMutation.error,
    revokingSdkKeyId: revokeSdkKeyMutation.isPending ? revokeSdkKeyMutation.variables?.sdkKeyId : undefined,
    sdkKeys: sdkKeysQuery.data ?? [],
    sdkKeysError: sdkKeysQuery.error
  };
};
