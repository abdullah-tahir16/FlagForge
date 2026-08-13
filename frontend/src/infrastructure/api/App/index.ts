import axios from "axios";
import type { AppHealth } from "../../../core/types/App";
import { getAccessToken } from "../Auth/session";
import type { HealthResponseDto } from "./types";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api/v1";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

apiClient.interceptors.request.use((config) => {
  const accessToken = getAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export const getHealth = async (): Promise<AppHealth> => {
  const response = await apiClient.get<HealthResponseDto>("/health");

  return {
    status: response.data.status,
    service: response.data.service
  };
};
