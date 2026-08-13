import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateEnvironmentFlagConfigInput } from "../../../core/types/FeatureFlag";
import { updateEnvironmentFlagConfig } from "../../api/FeatureFlag";

interface UpdateEnvironmentFlagConfigVariables {
  environmentId: string;
  flagId: string;
  input: UpdateEnvironmentFlagConfigInput;
  projectId: string;
}

export const useUpdateEnvironmentFlagConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ environmentId, flagId, input, projectId }: UpdateEnvironmentFlagConfigVariables) =>
      updateEnvironmentFlagConfig(projectId, flagId, environmentId, input),
    onSuccess: (featureFlag) => {
      void queryClient.invalidateQueries({ queryKey: ["feature-flags", featureFlag.projectId] });
      void queryClient.invalidateQueries({ queryKey: ["feature-flags", featureFlag.projectId, featureFlag.id] });
    }
  });
};
