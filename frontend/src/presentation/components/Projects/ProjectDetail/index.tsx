import { Link } from "react-router-dom";
import { BarChart3, Flag, Settings, Trash2, UsersRound } from "lucide-react";
import type { Environment } from "../../../../core/types/Environment";
import type { Project } from "../../../../core/types/Project";
import type { CreatedSdkKey, SdkKey } from "../../../../core/types/SdkKey";
import Alert from "../../Common/Alert";
import Badge from "../../Common/Badge";
import Button from "../../Common/Button";
import ConfirmDialog from "../../Common/ConfirmDialog";
import EmptyState from "../../Common/EmptyState";
import Panel from "../../Common/Panel";
import Skeleton from "../../Common/Skeleton";
import SdkKeyPanel from "../../SdkKeys/SdkKeyPanel";
import EnvironmentList from "../EnvironmentList";
import ProjectForm from "../ProjectForm";

interface Props {
  deleteErrorMessage?: string | null;
  environments: Environment[];
  environmentsErrorMessage?: string | null;
  environmentValidate: (values: Record<string, string>) => Partial<Record<string, string>>;
  copiedCreatedSdkKey: boolean;
  createSdkKeyErrorMessage?: string | null;
  createdSdkKey?: CreatedSdkKey;
  isCreatingSdkKey: boolean;
  isDeletingProject: boolean;
  isDeleteDialogOpen: boolean;
  isLoadingEnvironments: boolean;
  isLoadingProject: boolean;
  isLoadingSdkKeys: boolean;
  isRevokeSdkKeyDialogOpen: boolean;
  isRevokingSdkKey: boolean;
  isUpdatingEnvironment: boolean;
  isUpdatingProject: boolean;
  onCancelDeleteProject: () => void;
  onCancelRevokeSdkKey: () => void;
  onConfirmDeleteProject: () => Promise<void>;
  onConfirmRevokeSdkKey: () => Promise<void>;
  onCopyCreatedSdkKey: () => Promise<void>;
  onEnvironmentSubmit: (environmentId: string, values: Record<string, string>) => Promise<void>;
  onProjectSubmit: (values: Record<string, string>) => Promise<void>;
  onRequestDeleteProject: () => void;
  onRequestRevokeSdkKey: (sdkKey: SdkKey) => void;
  onSdkKeySubmit: (values: Record<string, string>) => Promise<void>;
  onSelectSdkKeyEnvironment: (environmentId: string) => void;
  project?: Project;
  projectErrorMessage?: string | null;
  projectInitialValues: Record<string, string>;
  projectValidate: (values: Record<string, string>) => Partial<Record<string, string>>;
  revokeSdkKeyErrorMessage?: string | null;
  revokingSdkKeyId?: string;
  sdkKeyValidate: (values: Record<string, string>) => Partial<Record<string, string>>;
  sdkKeys: SdkKey[];
  sdkKeysErrorMessage?: string | null;
  selectedRevokeSdkKey?: SdkKey;
  selectedSdkKeyEnvironment?: Environment;
  selectedSdkKeyEnvironmentId?: string;
  updateEnvironmentErrorMessage?: string | null;
  updateProjectErrorMessage?: string | null;
  updatingEnvironmentId?: string;
}

const ProjectDetail = ({
  deleteErrorMessage,
  environments,
  environmentsErrorMessage,
  environmentValidate,
  copiedCreatedSdkKey,
  createSdkKeyErrorMessage,
  createdSdkKey,
  isCreatingSdkKey,
  isDeletingProject,
  isDeleteDialogOpen,
  isLoadingEnvironments,
  isLoadingProject,
  isLoadingSdkKeys,
  isRevokeSdkKeyDialogOpen,
  isRevokingSdkKey,
  isUpdatingEnvironment,
  isUpdatingProject,
  onCancelDeleteProject,
  onCancelRevokeSdkKey,
  onConfirmDeleteProject,
  onConfirmRevokeSdkKey,
  onCopyCreatedSdkKey,
  onEnvironmentSubmit,
  onProjectSubmit,
  onRequestDeleteProject,
  onRequestRevokeSdkKey,
  onSdkKeySubmit,
  onSelectSdkKeyEnvironment,
  project,
  projectErrorMessage,
  projectInitialValues,
  projectValidate,
  revokeSdkKeyErrorMessage,
  revokingSdkKeyId,
  sdkKeyValidate,
  sdkKeys,
  sdkKeysErrorMessage,
  selectedRevokeSdkKey,
  selectedSdkKeyEnvironment,
  selectedSdkKeyEnvironmentId,
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
          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-app border border-app-border bg-app-surface px-3 py-2.5 text-sm font-semibold text-app-text transition duration-app hover:border-app-primary/50 hover:bg-app-surface-muted focus:outline-none focus:ring-2 focus:ring-app-focus focus:ring-offset-2"
              to={`/projects/${project.id}/flags`}
            >
              <Flag aria-hidden="true" className="h-4 w-4" />
              Manage flags
            </Link>
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-app border border-app-border bg-app-surface px-3 py-2.5 text-sm font-semibold text-app-text transition duration-app hover:border-app-primary/50 hover:bg-app-surface-muted focus:outline-none focus:ring-2 focus:ring-app-focus focus:ring-offset-2"
              to={`/projects/${project.id}/analytics`}
            >
              <BarChart3 aria-hidden="true" className="h-4 w-4" />
              Analytics
            </Link>
            <Link
              className="inline-flex min-h-11 items-center gap-2 rounded-app border border-app-border bg-app-surface px-3 py-2.5 text-sm font-semibold text-app-text transition duration-app hover:border-app-primary/50 hover:bg-app-surface-muted focus:outline-none focus:ring-2 focus:ring-app-focus focus:ring-offset-2"
              to={`/projects/${project.id}/segments`}
            >
              <UsersRound aria-hidden="true" className="h-4 w-4" />
              Manage segments
            </Link>
            <Button disabled={isDeletingProject} onClick={onRequestDeleteProject} type="button" variant="danger">
              <span className="inline-flex items-center gap-2">
                <Trash2 aria-hidden="true" className="h-4 w-4" />
                {isDeletingProject ? "Deleting" : "Delete project"}
              </span>
            </Button>
          </div>
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
            onManageSdkKeys={onSelectSdkKeyEnvironment}
            onSubmit={onEnvironmentSubmit}
            selectedSdkKeyEnvironmentId={selectedSdkKeyEnvironmentId}
            updatingEnvironmentId={updatingEnvironmentId}
            validate={environmentValidate}
          />
        ) : null}
      </Panel>

      {sdkKeysErrorMessage ? (
        <Alert tone="danger" title="SDK keys could not be loaded">
          {sdkKeysErrorMessage}
        </Alert>
      ) : null}
      <SdkKeyPanel
        copiedCreatedKey={copiedCreatedSdkKey}
        createErrorMessage={createSdkKeyErrorMessage}
        createdSdkKey={createdSdkKey}
        environment={selectedSdkKeyEnvironment}
        isCreating={isCreatingSdkKey}
        isLoading={isLoadingSdkKeys}
        isRevokeDialogOpen={isRevokeSdkKeyDialogOpen}
        isRevoking={isRevokingSdkKey}
        onCancelRevoke={onCancelRevokeSdkKey}
        onConfirmRevoke={onConfirmRevokeSdkKey}
        onCopyCreatedKey={onCopyCreatedSdkKey}
        onRequestRevoke={onRequestRevokeSdkKey}
        onSubmit={onSdkKeySubmit}
        revokeErrorMessage={revokeSdkKeyErrorMessage}
        revokingSdkKeyId={revokingSdkKeyId}
        sdkKeys={sdkKeys}
        selectedRevokeSdkKey={selectedRevokeSdkKey}
        validate={sdkKeyValidate}
      />
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
