import { apiClient } from "../App";
import { clearAccessToken, setAccessToken } from "./session";
import type { AuthResponseDto, CurrentUserResponseDto, LoginRequestDto, RegisterRequestDto } from "./types";

export const register = async (input: RegisterRequestDto): Promise<AuthResponseDto> => {
  const response = await apiClient.post<AuthResponseDto>("/auth/register", input, { withCredentials: true });
  setAccessToken(response.data.accessToken);

  return response.data;
};

export const login = async (input: LoginRequestDto): Promise<AuthResponseDto> => {
  const response = await apiClient.post<AuthResponseDto>("/auth/login", input, { withCredentials: true });
  setAccessToken(response.data.accessToken);

  return response.data;
};

export const refreshSession = async (): Promise<AuthResponseDto> => {
  const response = await apiClient.post<AuthResponseDto>("/auth/refresh", {}, { withCredentials: true });
  setAccessToken(response.data.accessToken);

  return response.data;
};

export const logout = async (): Promise<void> => {
  await apiClient.post("/auth/logout", {}, { withCredentials: true });
  clearAccessToken();
};

export const getCurrentUser = async (): Promise<CurrentUserResponseDto> => {
  const response = await apiClient.get<CurrentUserResponseDto>("/auth/me");

  return response.data;
};
