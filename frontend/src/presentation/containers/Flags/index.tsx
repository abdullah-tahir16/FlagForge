import AppShell from "../../components/AppShell";
import PageHeader from "../../components/Common/PageHeader";
import FlagsEntry from "../../components/FeatureFlags/FlagsEntry";
import { useFlagsFeature } from "../../hooks/Flags/useFlagsFeature";

interface Props {}

const FlagsContainer = (_props: Props) => {
  const feature = useFlagsFeature();

  return (
    <AppShell
      onLogout={feature.onLogout}
      organizationName={feature.currentOrganization?.name ?? "Dashboard"}
      userName={feature.currentUser ? `${feature.currentUser.firstName} ${feature.currentUser.lastName}` : "User"}
    >
      <PageHeader
        description="Select a project and manage boolean feature flags across its environments."
        title={feature.title}
      />
      <FlagsEntry
        isLoadingProjects={feature.isLoadingProjects}
        projects={feature.projects}
        projectsErrorMessage={feature.projectsErrorMessage}
      />
    </AppShell>
  );
};

export default FlagsContainer;
