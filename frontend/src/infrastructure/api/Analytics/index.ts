import type { AnalyticsFilters, AnalyticsOverview } from "../../../core/types/Analytics";
import { apiClient } from "../App";
import type { AnalyticsOverviewRequestDto, AnalyticsOverviewResponseDto } from "./types";

const compactFilters = (filters: AnalyticsFilters): AnalyticsOverviewRequestDto =>
  Object.entries(filters).reduce<AnalyticsOverviewRequestDto>((params, [key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      return { ...params, [key]: value };
    }

    return params;
  }, {});

export const getProjectAnalyticsOverview = async (
  projectId: string,
  filters: AnalyticsFilters
): Promise<AnalyticsOverview> => {
  const response = await apiClient.get<AnalyticsOverviewResponseDto>(`/projects/${projectId}/analytics/overview`, {
    params: compactFilters(filters)
  });

  return response.data;
};
