import { Link } from "react-router-dom";
import { Flag, FolderKanban } from "lucide-react";
import type { Project } from "../../../../core/types/Project";
import Alert from "../../Common/Alert";
import Badge from "../../Common/Badge";
import DataList from "../../Common/DataList";
import DataRow from "../../Common/DataRow";
import EmptyState from "../../Common/EmptyState";
import Skeleton from "../../Common/Skeleton";
import Toolbar from "../../Common/Toolbar";

interface Props {
  isLoadingProjects: boolean;
  projects: Project[];
  projectsErrorMessage?: string | null;
}

const FlagsEntry = ({ isLoadingProjects, projects, projectsErrorMessage }: Props) => (
  <section className="min-w-0">
    <Toolbar
      actions={
        <Badge tone="primary">
          {projects.length} {projects.length === 1 ? "project" : "projects"}
        </Badge>
      }
    >
      Select a project to manage boolean feature flags.
    </Toolbar>
    {projectsErrorMessage ? (
      <Alert tone="danger" title="Projects could not be loaded">
        {projectsErrorMessage}
      </Alert>
    ) : null}
    {isLoadingProjects ? <Skeleton rows={4} /> : null}
    {!isLoadingProjects && !projectsErrorMessage && projects.length === 0 ? (
      <EmptyState
        description="Create a project before adding boolean feature flags."
        icon={FolderKanban}
        title="No projects yet"
      />
    ) : null}
    {!isLoadingProjects && !projectsErrorMessage && projects.length > 0 ? (
      <DataList>
        {projects.map((project) => (
          <DataRow
            actions={
              <Link
                className="inline-flex min-h-11 items-center gap-2 rounded-app border border-app-border bg-app-surface px-3 py-2.5 text-sm font-semibold text-app-text transition duration-app hover:border-app-primary/50 hover:bg-app-surface-muted focus:outline-none focus:ring-2 focus:ring-app-focus focus:ring-offset-2"
                to={`/projects/${project.id}/flags`}
              >
                <Flag aria-hidden="true" className="h-4 w-4" />
                Manage flags
              </Link>
            }
            key={project.id}
          >
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-app-text">{project.name}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge>{project.key}</Badge>
                <span className="text-sm text-app-text-muted">{project.description ?? "No description"}</span>
              </div>
            </div>
          </DataRow>
        ))}
      </DataList>
    ) : null}
  </section>
);

export default FlagsEntry;
