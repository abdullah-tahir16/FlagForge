import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateSdkKeyInput } from "../../../core/types/SdkKey";
import { createSdkKey } from "../../api/SdkKey";
import { sdkKeysQueryKey } from "./useEnvironmentSdkKeys";

interface CreateSdkKeyVariables {
  environmentId: string;
  input: CreateSdkKeyInput;
  projectId: string;
}

export const useCreateSdkKey = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ environmentId, input, projectId }: CreateSdkKeyVariables) =>
      createSdkKey(projectId, environmentId, input),
    onSuccess: (sdkKey) => {
      void queryClient.invalidateQueries({ queryKey: sdkKeysQueryKey(undefined, sdkKey.environmentId) });
      void queryClient.invalidateQueries({ queryKey: ["sdk-keys"] });
    }
  });
};
