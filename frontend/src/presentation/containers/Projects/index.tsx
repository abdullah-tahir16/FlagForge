import AppShell from "../../components/AppShell";
import PageHeader from "../../components/Common/PageHeader";
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
      <PageHeader
        description="Create projects and manage the environments that future flags will target."
        title={feature.title}
      />
      <Projects
        createErrorMessage={feature.createErrorMessage}
        createInitialValues={feature.createInitialValues}
        deleteErrorMessage={feature.deleteErrorMessage}
        deletingProjectId={feature.deletingProjectId}
        isCreatingProject={feature.isCreatingProject}
        isDeletingProject={feature.isDeletingProject}
        isLoadingProjects={feature.isLoadingProjects}
        onCancelDeleteProject={feature.onCancelDeleteProject}
        onConfirmDeleteProject={feature.onConfirmDeleteProject}
        onCreateProjectSubmit={feature.onCreateProjectSubmit}
        onRequestDeleteProject={feature.onRequestDeleteProject}
        pendingDeleteProjectName={feature.pendingDeleteProjectName}
        projects={feature.projects}
        projectsErrorMessage={feature.projectsErrorMessage}
        validateProject={feature.validateProject}
      />
    </AppShell>
  );
};

export default ProjectsContainer;
