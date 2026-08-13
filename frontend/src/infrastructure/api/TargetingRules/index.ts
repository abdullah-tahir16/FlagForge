import { apiClient } from "../App";
import type {
  CreateTargetingRuleRequestDto,
  ReorderTargetingRulesRequestDto,
  TargetingRuleResponseDto,
  UpdateTargetingRuleRequestDto
} from "./types";

const getRulesPath = (projectId: string, flagId: string, environmentId: string) =>
  `/projects/${projectId}/flags/${flagId}/environments/${environmentId}/rules`;

export const getTargetingRules = async (
  projectId: string,
  flagId: string,
  environmentId: string
): Promise<TargetingRuleResponseDto[]> => {
  const response = await apiClient.get<TargetingRuleResponseDto[]>(getRulesPath(projectId, flagId, environmentId));

  return response.data;
};

export const createTargetingRule = async (
  projectId: string,
  flagId: string,
  environmentId: string,
  input: CreateTargetingRuleRequestDto
): Promise<TargetingRuleResponseDto> => {
  const response = await apiClient.post<TargetingRuleResponseDto>(getRulesPath(projectId, flagId, environmentId), input);

  return response.data;
};

export const updateTargetingRule = async (
  projectId: string,
  flagId: string,
  environmentId: string,
  ruleId: string,
  input: UpdateTargetingRuleRequestDto
): Promise<TargetingRuleResponseDto> => {
  const response = await apiClient.patch<TargetingRuleResponseDto>(
    `${getRulesPath(projectId, flagId, environmentId)}/${ruleId}`,
    input
  );

  return response.data;
};

export const deleteTargetingRule = async (
  projectId: string,
  flagId: string,
  environmentId: string,
  ruleId: string
): Promise<void> => {
  await apiClient.delete(`${getRulesPath(projectId, flagId, environmentId)}/${ruleId}`);
};

export const reorderTargetingRules = async (
  projectId: string,
  flagId: string,
  environmentId: string,
  input: ReorderTargetingRulesRequestDto
): Promise<TargetingRuleResponseDto[]> => {
  const response = await apiClient.post<TargetingRuleResponseDto[]>(
    `${getRulesPath(projectId, flagId, environmentId)}/reorder`,
    input
  );

  return response.data;
};
