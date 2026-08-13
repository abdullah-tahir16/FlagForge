import { Link } from "react-router-dom";
import AppShell from "../../components/AppShell";
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
      <section className="mx-auto max-w-6xl px-5 py-8">
        <div className="mb-8 flex flex-col gap-2">
          <Link className="w-fit text-sm font-semibold text-app-primary hover:text-app-primary-hover" to="/projects">
            Projects
          </Link>
          <h1 className="text-3xl font-semibold tracking-normal text-app-text">{feature.title}</h1>
          <p className="max-w-2xl text-base leading-7 text-app-text-muted">
            Keep project profile details and environments ready for feature flag configuration.
          </p>
        </div>
        <ProjectDetail
          deleteErrorMessage={feature.deleteErrorMessage}
          environments={feature.environments}
          environmentsErrorMessage={feature.environmentsErrorMessage}
          environmentValidate={feature.environmentValidate}
          isDeletingProject={feature.isDeletingProject}
          isLoadingEnvironments={feature.isLoadingEnvironments}
          isLoadingProject={feature.isLoadingProject}
          isUpdatingEnvironment={feature.isUpdatingEnvironment}
          isUpdatingProject={feature.isUpdatingProject}
          onDeleteProject={feature.onDeleteProject}
          onEnvironmentSubmit={feature.onEnvironmentSubmit}
          onProjectSubmit={feature.onProjectSubmit}
          project={feature.project}
          projectErrorMessage={feature.projectErrorMessage}
          projectInitialValues={feature.projectInitialValues}
          projectValidate={feature.projectValidate}
          updateEnvironmentErrorMessage={feature.updateEnvironmentErrorMessage}
          updateProjectErrorMessage={feature.updateProjectErrorMessage}
          updatingEnvironmentId={feature.updatingEnvironmentId}
        />
      </section>
    </AppShell>
  );
};

export default ProjectDetailContainer;
