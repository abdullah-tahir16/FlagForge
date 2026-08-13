import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AppShell from "../../components/AppShell";
import ProjectAnalytics from "../../components/Analytics/ProjectAnalytics";
import Badge from "../../components/Common/Badge";
import PageHeader from "../../components/Common/PageHeader";
import { useProjectAnalyticsFeature } from "../../hooks/ProjectAnalytics/useProjectAnalyticsFeature";

interface Props {}

const ProjectAnalyticsContainer = (_props: Props) => {
  const feature = useProjectAnalyticsFeature();

  return (
    <AppShell
      apiStatus={feature.apiStatus}
      isCheckingApi={feature.isCheckingApi}
      onLogout={feature.onLogout}
      organizationName={feature.currentOrganization?.name ?? "Dashboard"}
      userName={feature.currentUser ? `${feature.currentUser.firstName} ${feature.currentUser.lastName}` : "User"}
    >
      <PageHeader
        description="Review SDK evaluation volume, served values, reasons, and active flags for this project."
        eyebrow={
          <Link
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-app-primary hover:text-app-primary-hover"
            to={feature.projectId ? `/projects/${feature.projectId}` : "/projects"}
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Project
          </Link>
        }
        metadata={feature.project ? <Badge tone="primary">{feature.project.key}</Badge> : null}
        title={feature.title}
      />
      <ProjectAnalytics
        analyticsErrorMessage={feature.analyticsErrorMessage}
        environments={feature.environments}
        falsePercentage={feature.falsePercentage}
        featureFlags={feature.featureFlags}
        filters={feature.filters}
        hasEvents={feature.hasEvents}
        isLoadingAnalytics={feature.isLoadingAnalytics || feature.isLoadingProject}
        isRefetchingAnalytics={feature.isRefetchingAnalytics}
        maxBucketTotal={feature.maxBucketTotal}
        maxTopFlagTotal={feature.maxTopFlagTotal}
        onClearFilters={feature.onClearFilters}
        onEnvironmentChange={feature.onEnvironmentChange}
        onFlagKeyChange={feature.onFlagKeyChange}
        onRangeChange={feature.onRangeChange}
        overview={feature.overview}
        truePercentage={feature.truePercentage}
      />
    </AppShell>
  );
};

export default ProjectAnalyticsContainer;
