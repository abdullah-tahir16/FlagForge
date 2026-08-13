import { apiClient } from "../App";
import type { CreateProjectRequestDto, ProjectResponseDto, UpdateProjectRequestDto } from "./types";

export const getProjects = async (): Promise<ProjectResponseDto[]> => {
  const response = await apiClient.get<ProjectResponseDto[]>("/projects");

  return response.data;
};

export const getProject = async (projectId: string): Promise<ProjectResponseDto> => {
  const response = await apiClient.get<ProjectResponseDto>(`/projects/${projectId}`);

  return response.data;
};

export const createProject = async (input: CreateProjectRequestDto): Promise<ProjectResponseDto> => {
  const response = await apiClient.post<ProjectResponseDto>("/projects", input);

  return response.data;
};

export const updateProject = async (projectId: string, input: UpdateProjectRequestDto): Promise<ProjectResponseDto> => {
  const response = await apiClient.patch<ProjectResponseDto>(`/projects/${projectId}`, input);

  return response.data;
};

export const deleteProject = async (projectId: string): Promise<void> => {
  await apiClient.delete(`/projects/${projectId}`);
};
