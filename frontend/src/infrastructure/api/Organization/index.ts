import { apiClient } from "../App";
import type { OrganizationResponseDto, UpdateOrganizationRequestDto } from "./types";

export const getCurrentOrganization = async (): Promise<OrganizationResponseDto> => {
  const response = await apiClient.get<OrganizationResponseDto>("/organizations/current");

  return response.data;
};

export const updateCurrentOrganization = async (
  input: UpdateOrganizationRequestDto
): Promise<OrganizationResponseDto> => {
  const response = await apiClient.patch<OrganizationResponseDto>("/organizations/current", input);

  return response.data;
};
