import { useQuery } from "@tanstack/react-query";
import type { AnalyticsFilters } from "../../../core/types/Analytics";
import { getAccessToken } from "../../api/Auth/session";
import { getProjectAnalyticsOverview } from "../../api/Analytics";

export const projectAnalyticsOverviewQueryKey = (projectId: string | undefined, filters: AnalyticsFilters) => [
  "projects",
  projectId,
  "analytics",
  "overview",
  filters
];

export const useProjectAnalyticsOverview = (projectId: string | undefined, filters: AnalyticsFilters) =>
  useQuery({
    enabled: Boolean(getAccessToken() && projectId),
    queryFn: () => getProjectAnalyticsOverview(projectId as string, filters),
    queryKey: projectAnalyticsOverviewQueryKey(projectId, filters),
    retry: false
  });
