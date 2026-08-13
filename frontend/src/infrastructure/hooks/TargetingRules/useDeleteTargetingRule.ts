import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTargetingRule } from "../../api/TargetingRules";
import { targetingRulesQueryKey } from "./useTargetingRules";

interface DeleteTargetingRuleVariables {
  environmentId: string;
  flagId: string;
  projectId: string;
  ruleId: string;
}

export const useDeleteTargetingRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ environmentId, flagId, projectId, ruleId }: DeleteTargetingRuleVariables) =>
      deleteTargetingRule(projectId, flagId, environmentId, ruleId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: targetingRulesQueryKey(variables.projectId, variables.flagId, variables.environmentId)
      });
    }
  });
};
