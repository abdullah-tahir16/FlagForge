import { useMutation, useQueryClient } from "@tanstack/react-query";
import { revokeSdkKey } from "../../api/SdkKey";
import { sdkKeysQueryKey } from "./useEnvironmentSdkKeys";

interface RevokeSdkKeyVariables {
  environmentId: string;
  projectId: string;
  sdkKeyId: string;
}

export const useRevokeSdkKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ environmentId, projectId, sdkKeyId }: RevokeSdkKeyVariables) =>
      revokeSdkKey(projectId, environmentId, sdkKeyId),
    onSuccess: (_result, variables) => {
      void queryClient.invalidateQueries({ queryKey: sdkKeysQueryKey(variables.projectId, variables.environmentId) });
    }
  });
};
