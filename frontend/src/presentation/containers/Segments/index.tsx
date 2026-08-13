import AppShell from "../../components/AppShell";
import PageHeader from "../../components/Common/PageHeader";
import SegmentsEntry from "../../components/Segments/SegmentsEntry";
import { useSegmentsFeature } from "../../hooks/Segments/useSegmentsFeature";

interface Props {}

const SegmentsContainer = (_props: Props) => {
  const feature = useSegmentsFeature();

  return (
    <AppShell
      onLogout={feature.onLogout}
      organizationName={feature.currentOrganization?.name ?? "Dashboard"}
      userName={feature.currentUser ? `${feature.currentUser.firstName} ${feature.currentUser.lastName}` : "User"}
    >
      <PageHeader
        description="Select a project and manage reusable segments for flag targeting."
        title={feature.title}
      />
      <SegmentsEntry
        isLoadingProjects={feature.isLoadingProjects}
        projects={feature.projects}
        projectsErrorMessage={feature.projectsErrorMessage}
      />
    </AppShell>
  );
};

export default SegmentsContainer;
