import { apiClient } from "../App";
import type { EnvironmentResponseDto, UpdateEnvironmentRequestDto } from "./types";

export const getProjectEnvironments = async (projectId: string): Promise<EnvironmentResponseDto[]> => {
  const response = await apiClient.get<EnvironmentResponseDto[]>(`/projects/${projectId}/environments`);

  return response.data;
};

export const updateEnvironment = async (
  projectId: string,
  environmentId: string,
  input: UpdateEnvironmentRequestDto
): Promise<EnvironmentResponseDto> => {
  const response = await apiClient.patch<EnvironmentResponseDto>(
    `/projects/${projectId}/environments/${environmentId}`,
    input
  );

  return response.data;
};
