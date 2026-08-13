import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AppShell from "../../components/AppShell";
import Badge from "../../components/Common/Badge";
import PageHeader from "../../components/Common/PageHeader";
import ProjectFlagList from "../../components/FeatureFlags/ProjectFlagList";
import { useProjectFlagsFeature } from "../../hooks/ProjectFlags/useProjectFlagsFeature";

interface Props {}

const ProjectFlagsContainer = (_props: Props) => {
  const feature = useProjectFlagsFeature();

  return (
    <AppShell
      onLogout={feature.onLogout}
      organizationName={feature.currentOrganization?.name ?? "Dashboard"}
      userName={feature.currentUser ? `${feature.currentUser.firstName} ${feature.currentUser.lastName}` : "User"}
    >
      <PageHeader
        description="Create boolean flags and open each flag to configure environment behavior."
        eyebrow={
          <Link className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-app-primary hover:text-app-primary-hover" to="/flags">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Flags
          </Link>
        }
        metadata={feature.project ? <Badge tone="primary">{feature.project.key}</Badge> : null}
        title={feature.title}
      />
      <ProjectFlagList
        createErrorMessage={feature.createFeatureFlagErrorMessage}
        createInitialValues={feature.createFeatureFlagInitialValues}
        deleteErrorMessage={feature.deleteFeatureFlagErrorMessage}
        deletingFeatureFlagId={feature.deletingFeatureFlagId}
        featureFlags={feature.featureFlags}
        featureFlagsErrorMessage={feature.featureFlagsErrorMessage}
        isCreatingFeatureFlag={feature.isCreatingFeatureFlag}
        isDeletingFeatureFlag={feature.isDeletingFeatureFlag}
        isLoadingFeatureFlags={feature.isLoadingFeatureFlags}
        isLoadingProject={feature.isLoadingProject}
        onCancelDeleteFeatureFlag={feature.onCancelDeleteFeatureFlag}
        onConfirmDeleteFeatureFlag={feature.onConfirmDeleteFeatureFlag}
        onCreateFeatureFlagSubmit={feature.onCreateFeatureFlagSubmit}
        onRequestDeleteFeatureFlag={feature.onRequestDeleteFeatureFlag}
        pendingDeleteFeatureFlagName={feature.pendingDeleteFeatureFlagName}
        project={feature.project}
        projectErrorMessage={feature.projectErrorMessage}
        validateFeatureFlag={feature.validateFeatureFlag}
      />
    </AppShell>
  );
};

export default ProjectFlagsContainer;
