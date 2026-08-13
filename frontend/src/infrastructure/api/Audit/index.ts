import type { AuditLogFilters, AuditLogList } from "../../../core/types/Audit";
import { apiClient } from "../App";
import type { AuditLogFiltersRequestDto, AuditLogListResponseDto } from "./types";

const compactFilters = (filters: AuditLogFilters): AuditLogFiltersRequestDto =>
  Object.entries(filters).reduce<AuditLogFiltersRequestDto>((params, [key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      return { ...params, [key]: value };
    }

    return params;
  }, {});

export const getAuditLogs = async (filters: AuditLogFilters): Promise<AuditLogList> => {
  const response = await apiClient.get<AuditLogListResponseDto>("/audit", {
    params: compactFilters(filters)
  });

  return response.data;
};
