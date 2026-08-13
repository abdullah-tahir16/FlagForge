import { ArrowRight, FolderKanban, ScrollText, ToggleLeft, UsersRound } from "lucide-react";
import { Link } from "react-router-dom";
import AppShell from "../../components/AppShell";
import Button from "../../components/Common/Button";
import PageHeader from "../../components/Common/PageHeader";
import Panel from "../../components/Common/Panel";
import TextInput from "../../components/Common/TextInput";
import { useHomeFeature } from "../../hooks/Home/useHomeFeature";

const sectionIcons: Record<string, typeof FolderKanban> = {
  Audit: ScrollText,
  Flags: ToggleLeft,
  Projects: FolderKanban,
  Segments: UsersRound
};

interface Props {}

const HomeContainer = (_props: Props) => {
  const {
    currentOrganization,
    currentUser,
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
      onLogout={onLogout}
      organizationName={currentOrganization?.name ?? "Dashboard"}
      userName={currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : "User"}
    >
      <PageHeader
        description="Manage projects, environments, feature flags, and audit history from one organization."
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
        {sections.map((section) => {
          const Icon = sectionIcons[section.label] ?? FolderKanban;

          return (
            <Link
              className="group block rounded-app focus:outline-none focus:ring-2 focus:ring-app-focus focus:ring-offset-2"
              key={section.label}
              to={section.to}
            >
              <Panel className="h-full p-5 transition duration-app group-hover:border-app-primary/50 group-hover:bg-app-surface-muted">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-app border border-app-border bg-app-primary-muted text-app-primary">
                  <Icon aria-hidden="true" className="h-4 w-4" />
                </span>
                <h2 className="mt-3 text-base font-semibold text-app-text">{section.label}</h2>
                <p className="mt-1 text-sm leading-6 text-app-text-muted">{section.description}</p>
              </Panel>
            </Link>
          );
        })}
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
