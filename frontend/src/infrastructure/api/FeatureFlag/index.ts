import { apiClient } from "../App";
import type {
  CreateFeatureFlagRequestDto,
  FeatureFlagResponseDto,
  UpdateEnvironmentFlagConfigRequestDto,
  UpdateFeatureFlagRequestDto
} from "./types";

export const getProjectFeatureFlags = async (projectId: string): Promise<FeatureFlagResponseDto[]> => {
  const response = await apiClient.get<FeatureFlagResponseDto[]>(`/projects/${projectId}/flags`);

  return response.data;
};

export const getFeatureFlag = async (projectId: string, flagId: string): Promise<FeatureFlagResponseDto> => {
  const response = await apiClient.get<FeatureFlagResponseDto>(`/projects/${projectId}/flags/${flagId}`);

  return response.data;
};

export const createFeatureFlag = async (
  projectId: string,
  input: CreateFeatureFlagRequestDto
): Promise<FeatureFlagResponseDto> => {
  const response = await apiClient.post<FeatureFlagResponseDto>(`/projects/${projectId}/flags`, input);

  return response.data;
};

export const updateFeatureFlag = async (
  projectId: string,
  flagId: string,
  input: UpdateFeatureFlagRequestDto
): Promise<FeatureFlagResponseDto> => {
  const response = await apiClient.patch<FeatureFlagResponseDto>(`/projects/${projectId}/flags/${flagId}`, input);

  return response.data;
};

export const deleteFeatureFlag = async (projectId: string, flagId: string): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}/flags/${flagId}`);
};

export const updateEnvironmentFlagConfig = async (
  projectId: string,
  flagId: string,
  environmentId: string,
  input: UpdateEnvironmentFlagConfigRequestDto
): Promise<FeatureFlagResponseDto> => {
  const response = await apiClient.patch<FeatureFlagResponseDto>(
    `/projects/${projectId}/flags/${flagId}/environments/${environmentId}`,
    input
  );

  return response.data;
};
