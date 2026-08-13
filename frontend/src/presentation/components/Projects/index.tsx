import { Link } from "react-router-dom";
import { ExternalLink, FolderKanban, Plus, Trash2 } from "lucide-react";
import type { Project } from "../../../core/types/Project";
import Alert from "../Common/Alert";
import Badge from "../Common/Badge";
import Button from "../Common/Button";
import ConfirmDialog from "../Common/ConfirmDialog";
import DataList from "../Common/DataList";
import DataRow from "../Common/DataRow";
import EmptyState from "../Common/EmptyState";
import Panel from "../Common/Panel";
import Skeleton from "../Common/Skeleton";
import Toolbar from "../Common/Toolbar";
import ProjectForm from "./ProjectForm";

interface Props {
  createErrorMessage?: string | null;
  createInitialValues: Record<string, string>;
  deleteErrorMessage?: string | null;
  deletingProjectId?: string;
  isCreatingProject: boolean;
  isDeletingProject: boolean;
  isLoadingProjects: boolean;
  onCancelDeleteProject: () => void;
  onConfirmDeleteProject: () => Promise<void>;
  onCreateProjectSubmit: (values: Record<string, string>) => Promise<void>;
  onRequestDeleteProject: (projectId: string) => void;
  pendingDeleteProjectName?: string | null;
  projects: Project[];
  projectsErrorMessage?: string | null;
  validateProject: (values: Record<string, string>) => Partial<Record<string, string>>;
}

const Projects = ({
  createErrorMessage,
  createInitialValues,
  deleteErrorMessage,
  deletingProjectId,
  isCreatingProject,
  isDeletingProject,
  isLoadingProjects,
  onCancelDeleteProject,
  onConfirmDeleteProject,
  onCreateProjectSubmit,
  onRequestDeleteProject,
  pendingDeleteProjectName,
  projects,
  projectsErrorMessage,
  validateProject
}: Props) => (
  <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
    <Panel className="h-fit p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-app border border-app-border bg-app-primary-muted text-app-primary">
          <Plus aria-hidden="true" className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-app-text">Create project</h2>
          <p className="text-sm text-app-text-muted">Default environments are added automatically.</p>
        </div>
      </div>
      <ProjectForm
        errorMessage={createErrorMessage}
        initialValues={createInitialValues}
        isSubmitting={isCreatingProject}
        onSubmit={onCreateProjectSubmit}
        submitLabel="Create project"
        validate={validateProject}
      />
    </Panel>

    <section className="min-w-0">
      <Toolbar
        actions={
          <Badge tone="primary">
            {projects.length} {projects.length === 1 ? "project" : "projects"}
          </Badge>
        }
      >
        Organization projects
      </Toolbar>
      {projectsErrorMessage ? (
        <Alert tone="danger" title="Projects could not be loaded">
          {projectsErrorMessage}
        </Alert>
      ) : null}
      {deleteErrorMessage ? (
        <div className="mb-3">
          <Alert tone="danger" title="Project could not be deleted">
            {deleteErrorMessage}
          </Alert>
        </div>
      ) : null}
      {isLoadingProjects ? <Skeleton rows={4} /> : null}
      {!isLoadingProjects && !projectsErrorMessage && projects.length === 0 ? (
        <EmptyState
          description="Create the first workspace project before adding flags and rollout rules."
          icon={FolderKanban}
          title="No projects yet"
        />
      ) : null}
      {!isLoadingProjects && !projectsErrorMessage && projects.length > 0 ? (
        <DataList>
        {projects.map((project) => (
          <DataRow
            actions={
              <>
                <Link
                  className="inline-flex min-h-11 items-center gap-2 rounded-app border border-app-border bg-app-surface px-3 py-2.5 text-sm font-semibold text-app-text transition duration-app hover:border-app-primary/50 hover:bg-app-surface-muted focus:outline-none focus:ring-2 focus:ring-app-focus focus:ring-offset-2"
                  to={`/projects/${project.id}`}
                >
                  <ExternalLink aria-hidden="true" className="h-4 w-4" />
                  Open
                </Link>
                <Button
                  disabled={isDeletingProject}
                  onClick={() => onRequestDeleteProject(project.id)}
                  title={`Delete ${project.name}`}
                  type="button"
                  variant="secondary"
                >
                  <span className="inline-flex items-center gap-2">
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                    {isDeletingProject && deletingProjectId === project.id ? "Deleting" : "Delete"}
                  </span>
                </Button>
              </>
            }
            key={project.id}
          >
            <div className="flex min-w-0 flex-col gap-1">
              <Link className="truncate text-base font-semibold text-app-text hover:text-app-primary" to={`/projects/${project.id}`}>
                {project.name}
              </Link>
              <div className="flex flex-wrap gap-2">
                <Badge>{project.key}</Badge>
                <span className="min-w-0 text-sm text-app-text-muted">{project.description ?? "No description"}</span>
              </div>
            </div>
          </DataRow>
        ))}
        </DataList>
      ) : null}
    </section>
    <ConfirmDialog
      confirmLabel="Delete project"
      description={`Delete ${pendingDeleteProjectName ?? "this project"} and its environments. This action cannot be undone.`}
      isConfirming={isDeletingProject}
      onCancel={onCancelDeleteProject}
      onConfirm={() => void onConfirmDeleteProject()}
      open={Boolean(pendingDeleteProjectName)}
      title="Delete project"
    />
  </div>
);

export default Projects;
