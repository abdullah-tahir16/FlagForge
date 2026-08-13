import type { Environment } from "../../../../core/types/Environment";
import type { Project } from "../../../../core/types/Project";
import Button from "../../Common/Button";
import Panel from "../../Common/Panel";
import EnvironmentList from "../EnvironmentList";
import ProjectForm from "../ProjectForm";

interface Props {
  deleteErrorMessage?: string | null;
  environments: Environment[];
  environmentsErrorMessage?: string | null;
  environmentValidate: (values: Record<string, string>) => Partial<Record<string, string>>;
  isDeletingProject: boolean;
  isLoadingEnvironments: boolean;
  isLoadingProject: boolean;
  isUpdatingEnvironment: boolean;
  isUpdatingProject: boolean;
  onDeleteProject: () => Promise<void>;
  onEnvironmentSubmit: (environmentId: string, values: Record<string, string>) => Promise<void>;
  onProjectSubmit: (values: Record<string, string>) => Promise<void>;
  project?: Project;
  projectErrorMessage?: string | null;
  projectInitialValues: Record<string, string>;
  projectValidate: (values: Record<string, string>) => Partial<Record<string, string>>;
  updateEnvironmentErrorMessage?: string | null;
  updateProjectErrorMessage?: string | null;
  updatingEnvironmentId?: string;
}

const ProjectDetail = ({
  deleteErrorMessage,
  environments,
  environmentsErrorMessage,
  environmentValidate,
  isDeletingProject,
  isLoadingEnvironments,
  isLoadingProject,
  isUpdatingEnvironment,
  isUpdatingProject,
  onDeleteProject,
  onEnvironmentSubmit,
  onProjectSubmit,
  project,
  projectErrorMessage,
  projectInitialValues,
  projectValidate,
  updateEnvironmentErrorMessage,
  updateProjectErrorMessage,
  updatingEnvironmentId
}: Props) => {
  if (isLoadingProject) {
    return <Panel className="p-5 text-sm text-app-text-muted">Loading project</Panel>;
  }

  if (projectErrorMessage || !project) {
    return <Panel className="p-5 text-sm font-medium text-app-danger">{projectErrorMessage ?? "Project was not found."}</Panel>;
  }

  return (
    <div className="grid gap-5">
      <Panel className="p-5">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-semibold text-app-primary">{project.key}</p>
            <h2 className="mt-1 text-xl font-semibold text-app-text">Project settings</h2>
          </div>
          <Button disabled={isDeletingProject} onClick={onDeleteProject} type="button" variant="secondary">
            {isDeletingProject ? "Deleting" : "Delete project"}
          </Button>
        </div>
        {deleteErrorMessage ? (
          <p className="mb-4 rounded-app border border-app-danger/20 bg-app-danger-muted px-3 py-2.5 text-sm font-medium text-app-danger">
            {deleteErrorMessage}
          </p>
        ) : null}
        <ProjectForm
          errorMessage={updateProjectErrorMessage}
          initialValues={projectInitialValues}
          isSubmitting={isUpdatingProject}
          onSubmit={onProjectSubmit}
          submitLabel="Save project"
          validate={projectValidate}
        />
      </Panel>

      <Panel className="p-5">
        <div className="mb-5">
          <h2 className="text-xl font-semibold text-app-text">Environments</h2>
          <p className="mt-1 text-sm text-app-text-muted">Manage the environment names used by this project.</p>
        </div>
        {isLoadingEnvironments ? <p className="text-sm text-app-text-muted">Loading environments</p> : null}
        {!isLoadingEnvironments && environmentsErrorMessage ? (
          <p className="text-sm font-medium text-app-danger">{environmentsErrorMessage}</p>
        ) : null}
        {!isLoadingEnvironments && !environmentsErrorMessage && environments.length === 0 ? (
          <p className="rounded-app border border-app-border bg-app-surface-muted px-4 py-5 text-sm text-app-text-muted">
            No environments yet.
          </p>
        ) : null}
        {!isLoadingEnvironments && !environmentsErrorMessage ? (
          <EnvironmentList
            environments={environments}
            errorMessage={updateEnvironmentErrorMessage}
            isSubmitting={isUpdatingEnvironment}
            onSubmit={onEnvironmentSubmit}
            updatingEnvironmentId={updatingEnvironmentId}
            validate={environmentValidate}
          />
        ) : null}
      </Panel>
    </div>
  );
};

export default ProjectDetail;
