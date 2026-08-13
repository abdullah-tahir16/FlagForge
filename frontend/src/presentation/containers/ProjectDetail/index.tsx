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
      apiStatus={feature.apiStatus}
      isCheckingApi={feature.isCheckingApi}
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
        deleteErrorMessage={feature.deleteErrorMessage}
        environments={feature.environments}
        environmentsErrorMessage={feature.environmentsErrorMessage}
        environmentValidate={feature.environmentValidate}
        isDeleteDialogOpen={feature.isDeleteDialogOpen}
        isDeletingProject={feature.isDeletingProject}
        isLoadingEnvironments={feature.isLoadingEnvironments}
        isLoadingProject={feature.isLoadingProject}
        isUpdatingEnvironment={feature.isUpdatingEnvironment}
        isUpdatingProject={feature.isUpdatingProject}
        onCancelDeleteProject={feature.onCancelDeleteProject}
        onConfirmDeleteProject={feature.onConfirmDeleteProject}
        onEnvironmentSubmit={feature.onEnvironmentSubmit}
        onProjectSubmit={feature.onProjectSubmit}
        onRequestDeleteProject={feature.onRequestDeleteProject}
        project={feature.project}
        projectErrorMessage={feature.projectErrorMessage}
        projectInitialValues={feature.projectInitialValues}
        projectValidate={feature.projectValidate}
        updateEnvironmentErrorMessage={feature.updateEnvironmentErrorMessage}
        updateProjectErrorMessage={feature.updateProjectErrorMessage}
        updatingEnvironmentId={feature.updatingEnvironmentId}
      />
    </AppShell>
  );
};

export default ProjectDetailContainer;
