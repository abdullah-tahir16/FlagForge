import { Settings, Trash2 } from "lucide-react";
import type { Environment } from "../../../../core/types/Environment";
import type { Project } from "../../../../core/types/Project";
import Alert from "../../Common/Alert";
import Badge from "../../Common/Badge";
import Button from "../../Common/Button";
import ConfirmDialog from "../../Common/ConfirmDialog";
import EmptyState from "../../Common/EmptyState";
import Panel from "../../Common/Panel";
import Skeleton from "../../Common/Skeleton";
import EnvironmentList from "../EnvironmentList";
import ProjectForm from "../ProjectForm";

interface Props {
  deleteErrorMessage?: string | null;
  environments: Environment[];
  environmentsErrorMessage?: string | null;
  environmentValidate: (values: Record<string, string>) => Partial<Record<string, string>>;
  isDeletingProject: boolean;
  isDeleteDialogOpen: boolean;
  isLoadingEnvironments: boolean;
  isLoadingProject: boolean;
  isUpdatingEnvironment: boolean;
  isUpdatingProject: boolean;
  onCancelDeleteProject: () => void;
  onConfirmDeleteProject: () => Promise<void>;
  onEnvironmentSubmit: (environmentId: string, values: Record<string, string>) => Promise<void>;
  onProjectSubmit: (values: Record<string, string>) => Promise<void>;
  onRequestDeleteProject: () => void;
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
  isDeleteDialogOpen,
  isLoadingEnvironments,
  isLoadingProject,
  isUpdatingEnvironment,
  isUpdatingProject,
  onCancelDeleteProject,
  onConfirmDeleteProject,
  onEnvironmentSubmit,
  onProjectSubmit,
  onRequestDeleteProject,
  project,
  projectErrorMessage,
  projectInitialValues,
  projectValidate,
  updateEnvironmentErrorMessage,
  updateProjectErrorMessage,
  updatingEnvironmentId
}: Props) => {
  if (isLoadingProject) {
    return <Skeleton rows={5} />;
  }

  if (projectErrorMessage || !project) {
    return (
      <Alert tone="danger" title="Project could not be loaded">
        {projectErrorMessage ?? "Project was not found."}
      </Alert>
    );
  }

  return (
    <div className="grid gap-5">
      <Panel className="p-5">
        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap gap-2">
              <Badge tone="primary">{project.key}</Badge>
              <Badge tone="neutral">Settings</Badge>
            </div>
            <h2 className="text-lg font-semibold text-app-text">Project profile</h2>
            <p className="mt-1 text-sm text-app-text-muted">Name and description used across management surfaces.</p>
          </div>
          <Button disabled={isDeletingProject} onClick={onRequestDeleteProject} type="button" variant="danger">
            <span className="inline-flex items-center gap-2">
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              {isDeletingProject ? "Deleting" : "Delete project"}
            </span>
          </Button>
        </div>
        {deleteErrorMessage ? (
          <div className="mb-4">
            <Alert tone="danger" title="Project could not be deleted">
              {deleteErrorMessage}
            </Alert>
          </div>
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
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-app-text">Environments</h2>
            <p className="mt-1 text-sm text-app-text-muted">Manage the environment names used by this project.</p>
          </div>
          <Badge tone="info">
            {environments.length} {environments.length === 1 ? "environment" : "environments"}
          </Badge>
        </div>
        {isLoadingEnvironments ? <Skeleton rows={3} /> : null}
        {!isLoadingEnvironments && environmentsErrorMessage ? (
          <Alert tone="danger" title="Environments could not be loaded">
            {environmentsErrorMessage}
          </Alert>
        ) : null}
        {!isLoadingEnvironments && !environmentsErrorMessage && environments.length === 0 ? (
          <EmptyState
            description="Default environments should exist for every project after creation."
            icon={Settings}
            title="No environments yet"
          />
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
      <ConfirmDialog
        confirmLabel="Delete project"
        description={`Delete ${project.name} and its environments. This action cannot be undone.`}
        isConfirming={isDeletingProject}
        onCancel={onCancelDeleteProject}
        onConfirm={() => void onConfirmDeleteProject()}
        open={isDeleteDialogOpen}
        title="Delete project"
      />
    </div>
  );
};

export default ProjectDetail;
