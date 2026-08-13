import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import AppShell from "../../components/AppShell";
import Badge from "../../components/Common/Badge";
import PageHeader from "../../components/Common/PageHeader";
import ProjectDetail from "../../components/Projects/ProjectDetail";
import { useProjectDetailFeature } from "../../hooks/ProjectDetail/useProjectDetailFeature";

interface Props {}

const ProjectDetailContainer = (_props: Props) => {
  const feature = useProjectDetailFeature();

  return (
    <AppShell
      onLogout={feature.onLogout}
      organizationName={feature.currentOrganization?.name ?? "Dashboard"}
      userName={feature.currentUser ? `${feature.currentUser.firstName} ${feature.currentUser.lastName}` : "User"}
    >
      <PageHeader
        description="Keep project profile details and environments ready for feature flag configuration."
        eyebrow={
          <Link className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-app-primary hover:text-app-primary-hover" to="/projects">
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Projects
          </Link>
        }
        metadata={feature.project ? <Badge tone="primary">{feature.project.key}</Badge> : null}
        title={feature.title}
      />
      <ProjectDetail
        copiedCreatedSdkKey={feature.copiedCreatedSdkKey}
        createSdkKeyErrorMessage={feature.createSdkKeyErrorMessage}
        createdSdkKey={feature.createdSdkKey}
        deleteErrorMessage={feature.deleteErrorMessage}
        environments={feature.environments}
        environmentsErrorMessage={feature.environmentsErrorMessage}
        environmentValidate={feature.environmentValidate}
        isCreatingSdkKey={feature.isCreatingSdkKey}
        isDeleteDialogOpen={feature.isDeleteDialogOpen}
        isDeletingProject={feature.isDeletingProject}
        isLoadingEnvironments={feature.isLoadingEnvironments}
        isLoadingProject={feature.isLoadingProject}
        isLoadingSdkKeys={feature.isLoadingSdkKeys}
        isRevokeSdkKeyDialogOpen={feature.isRevokeSdkKeyDialogOpen}
        isRevokingSdkKey={feature.isRevokingSdkKey}
        isUpdatingEnvironment={feature.isUpdatingEnvironment}
        isUpdatingProject={feature.isUpdatingProject}
        onCancelDeleteProject={feature.onCancelDeleteProject}
        onCancelRevokeSdkKey={feature.onCancelRevokeSdkKey}
        onConfirmDeleteProject={feature.onConfirmDeleteProject}
        onConfirmRevokeSdkKey={feature.onConfirmRevokeSdkKey}
        onCopyCreatedSdkKey={feature.onCopyCreatedSdkKey}
        onEnvironmentSubmit={feature.onEnvironmentSubmit}
        onProjectSubmit={feature.onProjectSubmit}
        onRequestDeleteProject={feature.onRequestDeleteProject}
        onRequestRevokeSdkKey={feature.onRequestRevokeSdkKey}
        onSdkKeySubmit={feature.onSdkKeySubmit}
        onSelectSdkKeyEnvironment={feature.onSelectSdkKeyEnvironment}
        project={feature.project}
        projectErrorMessage={feature.projectErrorMessage}
        projectInitialValues={feature.projectInitialValues}
        projectValidate={feature.projectValidate}
        revokeSdkKeyErrorMessage={feature.revokeSdkKeyErrorMessage}
        revokingSdkKeyId={feature.revokingSdkKeyId}
        sdkKeyValidate={feature.sdkKeyValidate}
        sdkKeys={feature.sdkKeys}
        sdkKeysErrorMessage={feature.sdkKeysErrorMessage}
        selectedRevokeSdkKey={feature.selectedRevokeSdkKey}
        selectedSdkKeyEnvironment={feature.selectedSdkKeyEnvironment}
        selectedSdkKeyEnvironmentId={feature.selectedSdkKeyEnvironmentId}
        updateEnvironmentErrorMessage={feature.updateEnvironmentErrorMessage}
        updateProjectErrorMessage={feature.updateProjectErrorMessage}
        updatingEnvironmentId={feature.updatingEnvironmentId}
      />
    </AppShell>
  );
};

export default ProjectDetailContainer;
