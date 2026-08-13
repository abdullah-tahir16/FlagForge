import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateFeatureFlagInput } from "../../../core/types/FeatureFlag";
import { createFeatureFlag } from "../../api/FeatureFlag";

interface CreateFeatureFlagVariables {
  input: CreateFeatureFlagInput;
  projectId: string;
}

export const useCreateFeatureFlag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, projectId }: CreateFeatureFlagVariables) => createFeatureFlag(projectId, input),
    onSuccess: (featureFlag) => {
      void queryClient.invalidateQueries({ queryKey: ["feature-flags", featureFlag.projectId] });
    }
  });
};
