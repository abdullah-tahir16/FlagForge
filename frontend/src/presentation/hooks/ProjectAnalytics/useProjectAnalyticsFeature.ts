import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { AnalyticsFilters, AnalyticsRange } from "../../../core/types/Analytics";
import { useCurrentOrganization } from "../../../infrastructure/hooks/Organization/useCurrentOrganization";
import { useProjectAnalyticsUseCase } from "../../../infrastructure/useCases/Analytics/useProjectAnalyticsUseCase";
import { useAuthUseCase } from "../../../infrastructure/useCases/Auth/useAuthUseCase";

const defaultRange: AnalyticsRange = "7d";

const percentOf = (count: number, total: number) => (total > 0 ? Math.round((count / total) * 100) : 0);

export const useProjectAnalyticsFeature = () => {
  const auth = useAuthUseCase();
  const currentOrganizationQuery = useCurrentOrganization();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();
  const [filters, setFilters] = useState<AnalyticsFilters>({ range: defaultRange });
  const analytics = useProjectAnalyticsUseCase(projectId, filters);

  const overview = analytics.analyticsOverview;
  const totalEvaluations = overview?.totalEvaluations ?? 0;
  const truePercentage = percentOf(overview?.trueCount ?? 0, totalEvaluations);
  const falsePercentage = percentOf(overview?.falseCount ?? 0, totalEvaluations);

  const maxTopFlagTotal = useMemo(
    () => Math.max(1, ...(overview?.topFlags.map((flag) => flag.total) ?? [])),
    [overview?.topFlags]
  );
  const maxBucketTotal = useMemo(
    () => Math.max(1, ...(overview?.timeBuckets.map((bucket) => bucket.total) ?? [])),
    [overview?.timeBuckets]
  );

  const onEnvironmentChange = (environmentId: string) => {
    setFilters((current) => ({
      ...current,
      environmentId: environmentId || undefined
    }));
  };

  const onFlagKeyChange = (flagKey: string) => {
    setFilters((current) => ({
      ...current,
      flagKey: flagKey || undefined
    }));
  };

  const onRangeChange = (range: AnalyticsRange) => {
    setFilters((current) => ({
      ...current,
      range
    }));
  };

  const onClearFilters = () => {
    setFilters({ range: defaultRange });
  };

  const onLogout = async () => {
    await auth.logout();
    navigate("/login");
  };

  return {
    analyticsErrorMessage: analytics.analyticsError ? "Analytics could not be loaded." : null,
    currentOrganization: currentOrganizationQuery.data,
    currentUser: auth.currentUser,
    environments: analytics.environments,
    featureFlags: analytics.featureFlags,
    filters: {
      range: filters.range ?? defaultRange,
      environmentId: filters.environmentId ?? "",
      flagKey: filters.flagKey ?? ""
    },
    falsePercentage,
    hasEvents: totalEvaluations > 0,
    isLoadingAnalytics: analytics.isLoadingAnalytics,
    isLoadingProject: analytics.isLoadingProject,
    isRefetchingAnalytics: analytics.isRefetchingAnalytics,
    maxBucketTotal,
    maxTopFlagTotal,
    onClearFilters,
    onEnvironmentChange,
    onFlagKeyChange,
    onLogout,
    onRangeChange,
    overview,
    project: analytics.project,
    projectErrorMessage: analytics.projectError ? "Project could not be loaded." : null,
    projectId,
    title: analytics.project?.name ? `${analytics.project.name} analytics` : "Project analytics",
    truePercentage
  };
};
