import { Field, Form as FinalForm } from "react-final-form";
import type { EnvironmentFlagConfig } from "../../../../core/types/FeatureFlag";
import Alert from "../../Common/Alert";
import Badge from "../../Common/Badge";
import Button from "../../Common/Button";
import DataList from "../../Common/DataList";
import DataRow from "../../Common/DataRow";
import Form from "../../Common/Form";
import TextInput from "../../Common/TextInput";
import TargetingRuleManager from "../TargetingRuleManager";

interface Props {
  configs: EnvironmentFlagConfig[];
  errorMessage?: string | null;
  flagId: string;
  isSubmitting: boolean;
  onSubmit: (environmentId: string, values: Record<string, unknown>) => Promise<void>;
  projectId: string;
  updatingEnvironmentId?: string;
  validate: (values: Record<string, unknown>) => Partial<Record<string, string>>;
}

const EnvironmentConfigList = ({
  configs,
  errorMessage,
  flagId,
  isSubmitting,
  onSubmit,
  projectId,
  updatingEnvironmentId,
  validate
}: Props) => (
  <div className="grid gap-3">
    {errorMessage ? (
      <Alert tone="danger" title="Configuration could not be saved">
        {errorMessage}
      </Alert>
    ) : null}
    <DataList>
      {configs.map((config) => (
        <FinalForm
          initialValues={{ enabled: config.enabled, rolloutPercentage: config.rolloutPercentage, value: config.value }}
          key={config.id}
          onSubmit={(values) => onSubmit(config.environmentId, values)}
          render={({ handleSubmit, submitting }) => (
            <DataRow
              actions={
                <Button
                  className="w-full sm:w-fit"
                  disabled={isSubmitting || submitting || updatingEnvironmentId === config.environmentId}
                  form={`flag-config-${config.environmentId}`}
                  type="submit"
                  variant="secondary"
                >
                  {updatingEnvironmentId === config.environmentId ? "Saving" : "Save"}
                </Button>
              }
            >
              <Form
                className="grid gap-3 lg:grid-cols-[180px_minmax(0,1fr)] lg:items-center"
                id={`flag-config-${config.environmentId}`}
                onSubmit={handleSubmit}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-app-text">{config.environmentName}</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Badge>{config.environmentKey}</Badge>
                    <Badge tone={config.enabled ? "success" : "neutral"}>{config.enabled ? "Enabled" : "Disabled"}</Badge>
                    <Badge tone={config.value ? "primary" : "neutral"}>{config.value ? "Serves true" : "Serves false"}</Badge>
                    <Badge tone={config.rolloutPercentage === 100 ? "neutral" : "warning"}>
                      Rollout {config.rolloutPercentage}%
                    </Badge>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Field<boolean> name="enabled" type="checkbox">
                    {({ input }) => {
                      const { checked, name, onBlur, onChange, onFocus } = input;

                      return (
                        <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-app border border-app-border bg-app-surface-muted px-3 py-2 text-sm font-semibold text-app-text transition duration-app hover:bg-app-row-hover">
                          <span>Enabled</span>
                          <input
                            checked={Boolean(checked)}
                            className="h-5 w-5 cursor-pointer accent-app-primary"
                            name={name}
                            onBlur={onBlur}
                            onChange={onChange}
                            onFocus={onFocus}
                            type="checkbox"
                          />
                        </label>
                      );
                    }}
                  </Field>
                  <Field<boolean> name="value" type="checkbox">
                    {({ input }) => {
                      const { checked, name, onBlur, onChange, onFocus } = input;

                      return (
                        <label className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-app border border-app-border bg-app-surface-muted px-3 py-2 text-sm font-semibold text-app-text transition duration-app hover:bg-app-row-hover">
                          <span>Serve true</span>
                          <input
                            checked={Boolean(checked)}
                            className="h-5 w-5 cursor-pointer accent-app-primary"
                            name={name}
                            onBlur={onBlur}
                            onChange={onChange}
                            onFocus={onFocus}
                            type="checkbox"
                          />
                        </label>
                      );
                    }}
                  </Field>
                  <Field<number>
                    name="rolloutPercentage"
                    parse={(value) => (value === "" ? undefined : Number(value))}
                    type="number"
                  >
                    {({ input, meta }) => (
                      <TextInput
                        error={meta.touched ? meta.error : undefined}
                        inputMode="numeric"
                        label="Rollout %"
                        max={100}
                        min={0}
                        step={1}
                        {...input}
                      />
                    )}
                  </Field>
                </div>
              </Form>
              <TargetingRuleManager config={config} flagId={flagId} projectId={projectId} />
            </DataRow>
          )}
          validate={validate}
        />
      ))}
    </DataList>
  </div>
);

export default EnvironmentConfigList;
