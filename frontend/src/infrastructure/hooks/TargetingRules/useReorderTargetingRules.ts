import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { ReorderTargetingRulesInput } from "../../../core/types/TargetingRules";
import { reorderTargetingRules } from "../../api/TargetingRules";
import { targetingRulesQueryKey } from "./useTargetingRules";

interface ReorderTargetingRulesVariables {
  environmentId: string;
  flagId: string;
  input: ReorderTargetingRulesInput;
  projectId: string;
}

export const useReorderTargetingRules = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ environmentId, flagId, input, projectId }: ReorderTargetingRulesVariables) =>
      reorderTargetingRules(projectId, flagId, environmentId, input),
    onSuccess: (_targetingRules, variables) => {
      void queryClient.invalidateQueries({
        queryKey: targetingRulesQueryKey(variables.projectId, variables.flagId, variables.environmentId)
      });
    }
  });
};
