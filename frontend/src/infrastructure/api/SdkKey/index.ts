import { apiClient } from "../App";
import type { CreateSdkKeyRequestDto, CreatedSdkKeyResponseDto, SdkKeyResponseDto } from "./types";

const sdkKeyPath = (projectId: string, environmentId: string) =>
  `/projects/${projectId}/environments/${environmentId}/sdk-keys`;

export const createSdkKey = async (
  projectId: string,
  environmentId: string,
  input: CreateSdkKeyRequestDto
): Promise<CreatedSdkKeyResponseDto> => {
  const response = await apiClient.post<CreatedSdkKeyResponseDto>(sdkKeyPath(projectId, environmentId), input);

  return response.data;
};

export const getEnvironmentSdkKeys = async (
  projectId: string,
  environmentId: string
): Promise<SdkKeyResponseDto[]> => {
  const response = await apiClient.get<SdkKeyResponseDto[]>(sdkKeyPath(projectId, environmentId));

  return response.data;
};

export const revokeSdkKey = async (projectId: string, environmentId: string, sdkKeyId: string): Promise<void> => {
  await apiClient.delete(`${sdkKeyPath(projectId, environmentId)}/${sdkKeyId}`);
};
