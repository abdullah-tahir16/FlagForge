import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateFeatureFlagInput } from "../../../core/types/FeatureFlag";
import { updateFeatureFlag } from "../../api/FeatureFlag";

interface UpdateFeatureFlagVariables {
  flagId: string;
  input: UpdateFeatureFlagInput;
  projectId: string;
}

export const useUpdateFeatureFlag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ flagId, input, projectId }: UpdateFeatureFlagVariables) => updateFeatureFlag(projectId, flagId, input),
    onSuccess: (featureFlag) => {
      void queryClient.invalidateQueries({ queryKey: ["feature-flags", featureFlag.projectId] });
      void queryClient.invalidateQueries({ queryKey: ["feature-flags", featureFlag.projectId, featureFlag.id] });
    }
  });
};
