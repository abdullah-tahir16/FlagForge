import type {
  CreateTargetingRuleInput,
  TargetingRule,
  UpdateTargetingRuleInput
} from "../../../core/types/TargetingRules";
import { useCreateTargetingRule } from "../../hooks/TargetingRules/useCreateTargetingRule";
import { useDeleteTargetingRule } from "../../hooks/TargetingRules/useDeleteTargetingRule";
import { useReorderTargetingRules } from "../../hooks/TargetingRules/useReorderTargetingRules";
import { useTargetingRules } from "../../hooks/TargetingRules/useTargetingRules";
import { useUpdateTargetingRule } from "../../hooks/TargetingRules/useUpdateTargetingRule";

export const useTargetingRulesUseCase = (projectId?: string, flagId?: string, environmentId?: string) => {
  const createTargetingRuleMutation = useCreateTargetingRule();
  const deleteTargetingRuleMutation = useDeleteTargetingRule();
  const reorderTargetingRulesMutation = useReorderTargetingRules();
  const targetingRulesQuery = useTargetingRules(projectId, flagId, environmentId);
  const updateTargetingRuleMutation = useUpdateTargetingRule();

  const createRule = (input: CreateTargetingRuleInput) =>
    createTargetingRuleMutation.mutateAsync({
      environmentId: environmentId as string,
      flagId: flagId as string,
      input,
      projectId: projectId as string
    });

  const updateRule = (ruleId: string, input: UpdateTargetingRuleInput) =>
    updateTargetingRuleMutation.mutateAsync({
      environmentId: environmentId as string,
      flagId: flagId as string,
      input,
      projectId: projectId as string,
      ruleId
    });

  const deleteRule = (ruleId: string) =>
    deleteTargetingRuleMutation.mutateAsync({
      environmentId: environmentId as string,
      flagId: flagId as string,
      projectId: projectId as string,
      ruleId
    });

  const reorderRules = (rules: TargetingRule[]) =>
    reorderTargetingRulesMutation.mutateAsync({
      environmentId: environmentId as string,
      flagId: flagId as string,
      input: { ruleIds: rules.map((rule) => rule.id) },
      projectId: projectId as string
    });

  return {
    createRule,
    createRuleError: createTargetingRuleMutation.error,
    deleteRule,
    deleteRuleError: deleteTargetingRuleMutation.error,
    deletingRuleId: deleteTargetingRuleMutation.variables?.ruleId,
    isCreatingRule: createTargetingRuleMutation.isPending,
    isDeletingRule: deleteTargetingRuleMutation.isPending,
    isLoadingRules: targetingRulesQuery.isLoading,
    isReorderingRules: reorderTargetingRulesMutation.isPending,
    isUpdatingRule: updateTargetingRuleMutation.isPending,
    reorderRules,
    reorderRulesError: reorderTargetingRulesMutation.error,
    rules: targetingRulesQuery.data ?? [],
    rulesError: targetingRulesQuery.error,
    updateRule,
    updateRuleError: updateTargetingRuleMutation.error,
    updatingRuleId: updateTargetingRuleMutation.variables?.ruleId
  };
};
