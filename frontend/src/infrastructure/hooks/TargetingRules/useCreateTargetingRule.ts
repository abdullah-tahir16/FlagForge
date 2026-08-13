import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { CreateTargetingRuleInput } from "../../../core/types/TargetingRules";
import { createTargetingRule } from "../../api/TargetingRules";
import { targetingRulesQueryKey } from "./useTargetingRules";

interface CreateTargetingRuleVariables {
  environmentId: string;
  flagId: string;
  input: CreateTargetingRuleInput;
  projectId: string;
}

export const useCreateTargetingRule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ environmentId, flagId, input, projectId }: CreateTargetingRuleVariables) =>
      createTargetingRule(projectId, flagId, environmentId, input),
    onSuccess: (targetingRule, variables) => {
      void queryClient.invalidateQueries({
        queryKey: targetingRulesQueryKey(variables.projectId, variables.flagId, variables.environmentId)
      });
      void queryClient.invalidateQueries({ queryKey: ["feature-flags", variables.projectId, variables.flagId] });
      void queryClient.invalidateQueries({ queryKey: ["feature-flags", variables.projectId] });
    }
  });
};
