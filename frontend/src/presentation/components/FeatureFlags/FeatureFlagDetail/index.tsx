import { Flag } from "lucide-react";
import type { FeatureFlag } from "../../../../core/types/FeatureFlag";
import type { Project } from "../../../../core/types/Project";
import Alert from "../../Common/Alert";
import Badge from "../../Common/Badge";
import EmptyState from "../../Common/EmptyState";
import Panel from "../../Common/Panel";
import Skeleton from "../../Common/Skeleton";
import EnvironmentConfigList from "../EnvironmentConfigList";
import FeatureFlagForm from "../FeatureFlagForm";

interface Props {
  environmentConfigValidate: (values: Record<string, unknown>) => Partial<Record<string, string>>;
  featureFlag?: FeatureFlag;
  featureFlagErrorMessage?: string | null;
  featureFlagInitialValues: Record<string, string>;
  featureFlagValidate: (values: Record<string, string>) => Partial<Record<string, string>>;
  isLoadingFeatureFlag: boolean;
  isLoadingProject: boolean;
  isUpdatingEnvironmentFlagConfig: boolean;
  isUpdatingFeatureFlag: boolean;
  onEnvironmentConfigSubmit: (environmentId: string, values: Record<string, unknown>) => Promise<void>;
  onFeatureFlagSubmit: (values: Record<string, string>) => Promise<void>;
  project?: Project;
  projectErrorMessage?: string | null;
  updateEnvironmentConfigErrorMessage?: string | null;
  updateFeatureFlagErrorMessage?: string | null;
  updatingEnvironmentFlagConfigId?: string;
}

const FeatureFlagDetail = ({
  environmentConfigValidate,
  featureFlag,
  featureFlagErrorMessage,
  featureFlagInitialValues,
  featureFlagValidate,
  isLoadingFeatureFlag,
  isLoadingProject,
  isUpdatingEnvironmentFlagConfig,
  isUpdatingFeatureFlag,
  onEnvironmentConfigSubmit,
  onFeatureFlagSubmit,
  project,
  projectErrorMessage,
  updateEnvironmentConfigErrorMessage,
  updateFeatureFlagErrorMessage,
  updatingEnvironmentFlagConfigId
}: Props) => {
  if (isLoadingProject || isLoadingFeatureFlag) {
    return <Skeleton rows={6} />;
  }

  if (projectErrorMessage || !project) {
    return (
      <Alert tone="danger" title="Project could not be loaded">
        {projectErrorMessage ?? "Project was not found."}
      </Alert>
    );
  }

  if (featureFlagErrorMessage || !featureFlag) {
    return (
      <Alert tone="danger" title="Feature flag could not be loaded">
        {featureFlagErrorMessage ?? "Feature flag was not found."}
      </Alert>
    );
  }

  return (
    <div className="grid gap-5">
      <Panel className="p-5">
        <div className="mb-5">
          <div className="mb-2 flex flex-wrap gap-2">
            <Badge tone="primary">{featureFlag.key}</Badge>
            <Badge>{featureFlag.type.toLowerCase()}</Badge>
          </div>
          <h2 className="text-lg font-semibold text-app-text">Flag metadata</h2>
          <p className="mt-1 text-sm text-app-text-muted">The flag key stays stable after renaming.</p>
        </div>
        <FeatureFlagForm
          errorMessage={updateFeatureFlagErrorMessage}
          initialValues={featureFlagInitialValues}
          isSubmitting={isUpdatingFeatureFlag}
          onSubmit={onFeatureFlagSubmit}
          submitLabel="Save flag"
          validate={featureFlagValidate}
        />
      </Panel>

      <Panel className="p-5">
        <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-app-text">Environment configuration</h2>
            <p className="mt-1 text-sm text-app-text-muted">Control enabled state and served boolean value per environment.</p>
          </div>
          <Badge tone="info">
            {featureFlag.environmentConfigs.length}{" "}
            {featureFlag.environmentConfigs.length === 1 ? "configuration" : "configurations"}
          </Badge>
        </div>
        {featureFlag.environmentConfigs.length === 0 ? (
          <EmptyState
            description="This flag has no environment configurations yet."
            icon={Flag}
            title="No configurations"
          />
        ) : (
          <EnvironmentConfigList
            configs={featureFlag.environmentConfigs}
            errorMessage={updateEnvironmentConfigErrorMessage}
            isSubmitting={isUpdatingEnvironmentFlagConfig}
            onSubmit={onEnvironmentConfigSubmit}
            updatingEnvironmentId={updatingEnvironmentFlagConfigId}
            validate={environmentConfigValidate}
          />
        )}
      </Panel>
    </div>
  );
};

export default FeatureFlagDetail;
