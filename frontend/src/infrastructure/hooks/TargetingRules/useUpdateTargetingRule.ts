import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { UpdateTargetingRuleInput } from "../../../core/types/TargetingRules";
import { updateTargetingRule } from "../../api/TargetingRules";
import { targetingRulesQueryKey } from "./useTargetingRules";

interface UpdateTargetingRuleVariables {
  environmentId: string;
  flagId: string;
  input: UpdateTargetingRuleInput;
  projectId: string;
  ruleId: string;
}

export const useUpdateTargetingRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ environmentId, flagId, input, projectId, ruleId }: UpdateTargetingRuleVariables) =>
      updateTargetingRule(projectId, flagId, environmentId, ruleId, input),
    onSuccess: (_targetingRule, variables) => {
      void queryClient.invalidateQueries({
        queryKey: targetingRulesQueryKey(variables.projectId, variables.flagId, variables.environmentId)
      });
    }
  });
};
