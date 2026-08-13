import { ArrowRight } from "lucide-react";
import AppShell from "../../components/AppShell";
import Badge from "../../components/Common/Badge";
import Button from "../../components/Common/Button";
import PageHeader from "../../components/Common/PageHeader";
import Panel from "../../components/Common/Panel";
import TextInput from "../../components/Common/TextInput";
import { useHomeFeature } from "../../hooks/Home/useHomeFeature";

interface Props {}

const HomeContainer = (_props: Props) => {
  const {
    apiStatus,
    currentOrganization,
    currentUser,
    isCheckingApi,
    isUpdatingOrganization,
    navigate,
    onLogout,
    onOrganizationNameChange,
    onOrganizationSubmit,
    organizationName,
    sections,
    title
  } = useHomeFeature();

  return (
    <AppShell
      apiStatus={apiStatus}
      isCheckingApi={isCheckingApi}
      onLogout={onLogout}
      organizationName={currentOrganization?.name ?? "Dashboard"}
      userName={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "User"}
    >
      <PageHeader
        description="Manage projects, environments, feature flags, and audit history from one workspace."
        metadata={<Badge tone="primary">{apiStatus}</Badge>}
        title={title}
      />

      <Panel className="mb-6 p-5">
        <form className="grid gap-3" onSubmit={onOrganizationSubmit}>
          <div className="max-w-md">
            <TextInput
              label="Organization name"
              onChange={(event) => onOrganizationNameChange(event.target.value)}
              value={organizationName}
            />
          </div>
          <Button className="w-fit" disabled={isUpdatingOrganization} type="submit">
            {isUpdatingOrganization ? "Saving" : "Save organization"}
          </Button>
        </form>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((section, index) => (
          <Panel key={section} className="p-5">
            <h2 className="text-base font-medium text-app-text">{section}</h2>
            <div className="mt-4 h-2 rounded-full bg-app-muted">
              <div className={`h-2 w-1/3 rounded-full ${index % 2 === 0 ? "bg-app-primary" : "bg-app-accent"}`} />
            </div>
          </Panel>
        ))}
      </div>

      <div className="mt-6">
        <Button onClick={() => navigate("/projects")} type="button">
          <span className="inline-flex items-center gap-2">
            Manage projects
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </span>
        </Button>
      </div>
    </AppShell>
  );
};

export default HomeContainer;
