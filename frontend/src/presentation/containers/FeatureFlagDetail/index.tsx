import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AppShell from "../../components/AppShell";
import Badge from "../../components/Common/Badge";
import PageHeader from "../../components/Common/PageHeader";
import FeatureFlagDetail from "../../components/FeatureFlags/FeatureFlagDetail";
import { useFeatureFlagDetailFeature } from "../../hooks/FeatureFlagDetail/useFeatureFlagDetailFeature";

interface Props {}

const FeatureFlagDetailContainer = (_props: Props) => {
  const feature = useFeatureFlagDetailFeature();

  return (
    <AppShell
      apiStatus={feature.apiStatus}
      isCheckingApi={feature.isCheckingApi}
      onLogout={feature.onLogout}
      organizationName={feature.currentOrganization?.name ?? "Dashboard"}
      userName={feature.currentUser ? `${feature.currentUser.firstName} ${feature.currentUser.lastName}` : "User"}
    >
      <PageHeader
        description="Edit flag metadata and configure served boolean values by environment."
        eyebrow={
          <Link
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-app-primary hover:text-app-primary-hover"
            to={feature.projectId ? `/projects/${feature.projectId}/flags` : "/flags"}
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Project flags
          </Link>
        }
        metadata={
          feature.featureFlag ? (
            <>
              <Badge tone="primary">{feature.featureFlag.key}</Badge>
              <Badge>{feature.featureFlag.type.toLowerCase()}</Badge>
            </>
          ) : null
        }
        title={feature.title}
      />
      <FeatureFlagDetail
        environmentConfigValidate={feature.environmentConfigValidate}
        featureFlag={feature.featureFlag}
        featureFlagErrorMessage={feature.featureFlagErrorMessage}
        featureFlagInitialValues={feature.featureFlagInitialValues}
        featureFlagValidate={feature.featureFlagValidate}
        isLoadingFeatureFlag={feature.isLoadingFeatureFlag}
        isLoadingProject={feature.isLoadingProject}
        isUpdatingEnvironmentFlagConfig={feature.isUpdatingEnvironmentFlagConfig}
        isUpdatingFeatureFlag={feature.isUpdatingFeatureFlag}
        onEnvironmentConfigSubmit={feature.onEnvironmentConfigSubmit}
        onFeatureFlagSubmit={feature.onFeatureFlagSubmit}
        project={feature.project}
        projectErrorMessage={feature.projectErrorMessage}
        updateEnvironmentConfigErrorMessage={feature.updateEnvironmentConfigErrorMessage}
        updateFeatureFlagErrorMessage={feature.updateFeatureFlagErrorMessage}
        updatingEnvironmentFlagConfigId={feature.updatingEnvironmentFlagConfigId}
      />
    </AppShell>
  );
};

export default FeatureFlagDetailContainer;
