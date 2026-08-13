import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteFeatureFlag } from "../../api/FeatureFlag";

interface DeleteFeatureFlagVariables {
  flagId: string;
  projectId: string;
}

export const useDeleteFeatureFlag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ flagId, projectId }: DeleteFeatureFlagVariables) => deleteFeatureFlag(projectId, flagId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["feature-flags", variables.projectId] });
      void queryClient.invalidateQueries({ queryKey: ["feature-flags", variables.projectId, variables.flagId] });
    }
  });
};
