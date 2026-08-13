import { Link } from "react-router-dom";
import type { Project } from "../../../core/types/Project";
import Button from "../Common/Button";
import Panel from "../Common/Panel";
import ProjectForm from "./ProjectForm";

interface Props {
  createErrorMessage?: string | null;
  createInitialValues: Record<string, string>;
  deleteErrorMessage?: string | null;
  deletingProjectId?: string;
  isCreatingProject: boolean;
  isDeletingProject: boolean;
  isLoadingProjects: boolean;
  onCreateProjectSubmit: (values: Record<string, string>) => Promise<void>;
  onDeleteProject: (projectId: string) => Promise<void>;
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
  onCreateProjectSubmit,
  onDeleteProject,
  projects,
  projectsErrorMessage,
  validateProject
}: Props) => (
  <div className="grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
    <Panel className="p-5">
      <h2 className="mb-4 text-xl font-semibold text-app-text">Create project</h2>
      <ProjectForm
        errorMessage={createErrorMessage}
        initialValues={createInitialValues}
        isSubmitting={isCreatingProject}
        onSubmit={onCreateProjectSubmit}
        submitLabel="Create project"
        validate={validateProject}
      />
    </Panel>

    <Panel className="p-5">
      <div className="mb-5 flex flex-col gap-1">
        <h2 className="text-xl font-semibold text-app-text">Organization projects</h2>
        <p className="text-sm text-app-text-muted">Each project starts with Development, Staging, and Production.</p>
      </div>
      {projectsErrorMessage ? (
        <p className="rounded-app border border-app-danger/20 bg-app-danger-muted px-3 py-2.5 text-sm font-medium text-app-danger">
          {projectsErrorMessage}
        </p>
      ) : null}
      {deleteErrorMessage ? (
        <p className="mb-3 rounded-app border border-app-danger/20 bg-app-danger-muted px-3 py-2.5 text-sm font-medium text-app-danger">
          {deleteErrorMessage}
        </p>
      ) : null}
      {isLoadingProjects ? <p className="text-sm text-app-text-muted">Loading projects</p> : null}
      {!isLoadingProjects && !projectsErrorMessage && projects.length === 0 ? (
        <p className="rounded-app border border-app-border bg-app-surface-muted px-4 py-5 text-sm text-app-text-muted">
          No projects yet.
        </p>
      ) : null}
      <div className="grid gap-3">
        {projects.map((project) => (
          <div
            className="grid gap-3 rounded-app border border-app-border bg-app-surface-muted p-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
            key={project.id}
          >
            <div>
              <Link className="text-base font-semibold text-app-text hover:text-app-primary" to={`/projects/${project.id}`}>
                {project.name}
              </Link>
              <p className="mt-1 text-sm text-app-text-muted">{project.description ?? project.key}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                className="inline-flex min-h-11 items-center rounded-app border border-app-border bg-app-surface px-4 py-2.5 text-sm font-semibold text-app-text transition hover:border-app-primary/50 hover:bg-app-surface-muted"
                to={`/projects/${project.id}`}
              >
                Open
              </Link>
              <Button
                disabled={isDeletingProject && deletingProjectId === project.id}
                onClick={() => void onDeleteProject(project.id)}
                type="button"
                variant="secondary"
              >
                {deletingProjectId === project.id ? "Deleting" : "Delete"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  </div>
);

export default Projects;
