import { Link } from "react-router-dom";
import { ExternalLink, Flag, Plus, Trash2 } from "lucide-react";
import type { FeatureFlag } from "../../../../core/types/FeatureFlag";
import type { Project } from "../../../../core/types/Project";
import Alert from "../../Common/Alert";
import Badge from "../../Common/Badge";
import Button from "../../Common/Button";
import ConfirmDialog from "../../Common/ConfirmDialog";
import DataList from "../../Common/DataList";
import DataRow from "../../Common/DataRow";
import EmptyState from "../../Common/EmptyState";
import Panel from "../../Common/Panel";
import Skeleton from "../../Common/Skeleton";
import Toolbar from "../../Common/Toolbar";
import FeatureFlagForm from "../FeatureFlagForm";

interface Props {
  createErrorMessage?: string | null;
  createInitialValues: Record<string, string>;
  deleteErrorMessage?: string | null;
  deletingFeatureFlagId?: string;
  featureFlags: FeatureFlag[];
  featureFlagsErrorMessage?: string | null;
  isCreatingFeatureFlag: boolean;
  isDeletingFeatureFlag: boolean;
  isLoadingFeatureFlags: boolean;
  isLoadingProject: boolean;
  onCancelDeleteFeatureFlag: () => void;
  onConfirmDeleteFeatureFlag: () => Promise<void>;
  onCreateFeatureFlagSubmit: (values: Record<string, string>) => Promise<void>;
  onRequestDeleteFeatureFlag: (flagId: string) => void;
  pendingDeleteFeatureFlagName?: string | null;
  project?: Project;
  projectErrorMessage?: string | null;
  validateFeatureFlag: (values: Record<string, string>) => Partial<Record<string, string>>;
}

const ProjectFlagList = ({
  createErrorMessage,
  createInitialValues,
  deleteErrorMessage,
  deletingFeatureFlagId,
  featureFlags,
  featureFlagsErrorMessage,
  isCreatingFeatureFlag,
  isDeletingFeatureFlag,
  isLoadingFeatureFlags,
  isLoadingProject,
  onCancelDeleteFeatureFlag,
  onConfirmDeleteFeatureFlag,
  onCreateFeatureFlagSubmit,
  onRequestDeleteFeatureFlag,
  pendingDeleteFeatureFlagName,
  project,
  projectErrorMessage,
  validateFeatureFlag
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
    <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
      <Panel className="h-fit p-5">
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-app border border-app-border bg-app-primary-muted text-app-primary">
            <Plus aria-hidden="true" className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-app-text">Create flag</h2>
            <p className="text-sm text-app-text-muted">Default environment configs are added automatically.</p>
          </div>
        </div>
        <FeatureFlagForm
          errorMessage={createErrorMessage}
          initialValues={createInitialValues}
          isSubmitting={isCreatingFeatureFlag}
          onSubmit={onCreateFeatureFlagSubmit}
          submitLabel="Create flag"
          validate={validateFeatureFlag}
        />
      </Panel>

      <section className="min-w-0">
        <Toolbar
          actions={
            <Badge tone="primary">
              {featureFlags.length} {featureFlags.length === 1 ? "flag" : "flags"}
            </Badge>
          }
        >
          Boolean flags for {project.name}
        </Toolbar>
        {featureFlagsErrorMessage ? (
          <Alert tone="danger" title="Feature flags could not be loaded">
            {featureFlagsErrorMessage}
          </Alert>
        ) : null}
        {deleteErrorMessage ? (
          <div className="mb-3">
            <Alert tone="danger" title="Feature flag could not be deleted">
              {deleteErrorMessage}
            </Alert>
          </div>
        ) : null}
        {isLoadingFeatureFlags ? <Skeleton rows={4} /> : null}
        {!isLoadingFeatureFlags && !featureFlagsErrorMessage && featureFlags.length === 0 ? (
          <EmptyState
            description="Create the first boolean flag for this project before configuring environments."
            icon={Flag}
            title="No feature flags yet"
          />
        ) : null}
        {!isLoadingFeatureFlags && !featureFlagsErrorMessage && featureFlags.length > 0 ? (
          <DataList>
            {featureFlags.map((featureFlag) => (
              <DataRow
                actions={
                  <>
                    <Link
                      className="inline-flex min-h-11 items-center gap-2 rounded-app border border-app-border bg-app-surface px-3 py-2.5 text-sm font-semibold text-app-text transition duration-app hover:border-app-primary/50 hover:bg-app-surface-muted focus:outline-none focus:ring-2 focus:ring-app-focus focus:ring-offset-2"
                      to={`/projects/${project.id}/flags/${featureFlag.id}`}
                    >
                      <ExternalLink aria-hidden="true" className="h-4 w-4" />
                      Open
                    </Link>
                    <Button
                      disabled={isDeletingFeatureFlag}
                      onClick={() => onRequestDeleteFeatureFlag(featureFlag.id)}
                      title={`Delete ${featureFlag.name}`}
                      type="button"
                      variant="secondary"
                    >
                      <span className="inline-flex items-center gap-2">
                        <Trash2 aria-hidden="true" className="h-4 w-4" />
                        {isDeletingFeatureFlag && deletingFeatureFlagId === featureFlag.id ? "Deleting" : "Delete"}
                      </span>
                    </Button>
                  </>
                }
                key={featureFlag.id}
              >
                <div className="min-w-0">
                  <Link
                    className="truncate text-base font-semibold text-app-text hover:text-app-primary"
                    to={`/projects/${project.id}/flags/${featureFlag.id}`}
                  >
                    {featureFlag.name}
                  </Link>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Badge>{featureFlag.key}</Badge>
                    <span className="text-sm text-app-text-muted">
                      {featureFlag.description ?? "No description"}
                    </span>
                  </div>
                </div>
              </DataRow>
            ))}
          </DataList>
        ) : null}
      </section>
      <ConfirmDialog
        confirmLabel="Delete feature flag"
        description={`Delete ${pendingDeleteFeatureFlagName ?? "this feature flag"} and its environment configuration. This action cannot be undone.`}
        isConfirming={isDeletingFeatureFlag}
        onCancel={onCancelDeleteFeatureFlag}
        onConfirm={() => void onConfirmDeleteFeatureFlag()}
        open={Boolean(pendingDeleteFeatureFlagName)}
        title="Delete feature flag"
      />
    </div>
  );
};

export default ProjectFlagList;
