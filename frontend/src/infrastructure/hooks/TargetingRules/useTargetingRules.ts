import { useQuery } from "@tanstack/react-query";
import { getTargetingRules } from "../../api/TargetingRules";

export const targetingRulesQueryKey = (projectId?: string, flagId?: string, environmentId?: string) => [
  "targeting-rules",
  projectId,
  flagId,
  environmentId
];

export const useTargetingRules = (projectId?: string, flagId?: string, environmentId?: string) =>
  useQuery({
    enabled: Boolean(projectId && flagId && environmentId),
    queryFn: () => getTargetingRules(projectId as string, flagId as string, environmentId as string),
    queryKey: targetingRulesQueryKey(projectId, flagId, environmentId)
  });
