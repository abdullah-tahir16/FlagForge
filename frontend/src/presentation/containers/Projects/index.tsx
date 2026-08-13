import AppShell from "../../components/AppShell";
import Projects from "../../components/Projects";
import { useProjectsFeature } from "../../hooks/Projects/useProjectsFeature";

interface Props {}

const ProjectsContainer = (_props: Props) => {
  const feature = useProjectsFeature();

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
          <h1 className="text-3xl font-semibold tracking-normal text-app-text">{feature.title}</h1>
          <p className="max-w-2xl text-base leading-7 text-app-text-muted">
            Create projects and manage the environments that future flags will target.
          </p>
        </div>
        <Projects
          createErrorMessage={feature.createErrorMessage}
          createInitialValues={feature.createInitialValues}
          deleteErrorMessage={feature.deleteErrorMessage}
          deletingProjectId={feature.deletingProjectId}
          isCreatingProject={feature.isCreatingProject}
          isDeletingProject={feature.isDeletingProject}
          isLoadingProjects={feature.isLoadingProjects}
          onCreateProjectSubmit={feature.onCreateProjectSubmit}
          onDeleteProject={feature.onDeleteProject}
          projects={feature.projects}
          projectsErrorMessage={feature.projectsErrorMessage}
          validateProject={feature.validateProject}
        />
      </section>
    </AppShell>
  );
};

export default ProjectsContainer;
