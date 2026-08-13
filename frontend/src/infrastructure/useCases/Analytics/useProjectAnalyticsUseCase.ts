import type { AnalyticsFilters } from "../../../core/types/Analytics";
import { useProjectEnvironments } from "../../hooks/Environment/useProjectEnvironments";
import { useProjectFeatureFlags } from "../../hooks/FeatureFlag/useProjectFeatureFlags";
import { useProject } from "../../hooks/Project/useProject";
import { useProjectAnalyticsOverview } from "../../hooks/Analytics/useProjectAnalyticsOverview";

export const useProjectAnalyticsUseCase = (projectId: string | undefined, filters: AnalyticsFilters) => {
  const analyticsQuery = useProjectAnalyticsOverview(projectId, filters);
  const environmentsQuery = useProjectEnvironments(projectId);
  const featureFlagsQuery = useProjectFeatureFlags(projectId);
  const projectQuery = useProject(projectId);

  return {
    analyticsError: analyticsQuery.error,
    analyticsOverview: analyticsQuery.data,
    environments: environmentsQuery.data ?? [],
    environmentsError: environmentsQuery.error,
    featureFlags: featureFlagsQuery.data ?? [],
    featureFlagsError: featureFlagsQuery.error,
    isLoadingAnalytics: analyticsQuery.isLoading,
    isLoadingEnvironments: environmentsQuery.isLoading,
    isLoadingFeatureFlags: featureFlagsQuery.isLoading,
    isLoadingProject: projectQuery.isLoading,
    isRefetchingAnalytics: analyticsQuery.isFetching && !analyticsQuery.isLoading,
    project: projectQuery.data,
    projectError: projectQuery.error
  };
};
