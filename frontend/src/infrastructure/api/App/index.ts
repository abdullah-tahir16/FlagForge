import axios from "axios";
import type { AppHealth } from "../../../core/types/App";
import type { HealthResponseDto } from "./types";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3001/api/v1";

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json"
  }
});

export const getHealth = async (): Promise<AppHealth> => {
  const response = await apiClient.get<HealthResponseDto>("/health");

  return {
    status: response.data.status,
    service: response.data.service
  };
};
