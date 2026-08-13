import { useMemo, useState } from "react";
import { Field, Form as FinalForm } from "react-final-form";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, X } from "lucide-react";
import type { EnvironmentFlagConfig } from "../../../../core/types/FeatureFlag";
import type { TargetingRule } from "../../../../core/types/TargetingRules";
import { useTargetingRulesUseCase } from "../../../../infrastructure/useCases/TargetingRules/useTargetingRulesUseCase";
import { validateWithSchema } from "../../../hooks/Auth/fns";
import {
  targetingRuleFormSchema,
  targetingRuleOperatorLabels,
  targetingRuleOperatorOptions,
  targetingRuleSourceOptions
} from "../../../hooks/TargetingRules/data";
import {
  formatComparisonValue,
  getTargetingRuleInitialValues,
  moveTargetingRule,
  parseTargetingRuleFormValues
} from "../../../hooks/TargetingRules/fns";
import Alert from "../../Common/Alert";
import Badge from "../../Common/Badge";
import Button from "../../Common/Button";
import ConfirmDialog from "../../Common/ConfirmDialog";
import DataList from "../../Common/DataList";
import DataRow from "../../Common/DataRow";
import EmptyState from "../../Common/EmptyState";
import Form from "../../Common/Form";
import Select from "../../Common/Select";
import Skeleton from "../../Common/Skeleton";
import TextInput from "../../Common/TextInput";

interface Props {
  config: EnvironmentFlagConfig;
  flagId: string;
  projectId: string;
}

const TargetingRuleManager = ({ config, flagId, projectId }: Props) => {
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [pendingDeleteRule, setPendingDeleteRule] = useState<TargetingRule | null>(null);
  const targetingRules = useTargetingRulesUseCase(projectId, flagId, config.environmentId);
  const validateRule = useMemo(() => validateWithSchema(targetingRuleFormSchema), []);
  const editingRule = targetingRules.rules.find((rule) => rule.id === editingRuleId);
  const mutationError =
    targetingRules.createRuleError ??
    targetingRules.updateRuleError ??
    targetingRules.deleteRuleError ??
    targetingRules.reorderRulesError;

  const onCreateRuleSubmit = async (values: Record<string, unknown>) => {
    await targetingRules.createRule(parseTargetingRuleFormValues(targetingRuleFormSchema.parse(values)));
  };

  const onEditRuleSubmit = async (values: Record<string, unknown>) => {
    if (!editingRule) {
      return;
    }

    await targetingRules.updateRule(editingRule.id, parseTargetingRuleFormValues(targetingRuleFormSchema.parse(values)));
    setEditingRuleId(null);
  };

  const onMoveRule = async (ruleId: string, direction: "down" | "up") => {
    await targetingRules.reorderRules(moveTargetingRule(targetingRules.rules, ruleId, direction));
  };

  const onConfirmDeleteRule = async () => {
    if (!pendingDeleteRule) {
      return;
    }

    await targetingRules.deleteRule(pendingDeleteRule.id);
    setPendingDeleteRule(null);
  };

  return (
    <div className="mt-4 grid gap-3 border-t border-app-border pt-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-app-text">Targeting rules</h3>
          <p className="mt-1 text-sm text-app-text-muted">First matching rule wins before rollout.</p>
        </div>
        <Badge tone="primary">
          {targetingRules.rules.length} {targetingRules.rules.length === 1 ? "rule" : "rules"}
        </Badge>
      </div>

      {mutationError ? (
        <Alert tone="danger" title="Targeting rule action failed">
          Review the rule values and try again.
        </Alert>
      ) : null}

      <FinalForm
        initialValues={getTargetingRuleInitialValues(editingRule)}
        key={editingRule?.id ?? "create-targeting-rule"}
        onSubmit={editingRule ? onEditRuleSubmit : onCreateRuleSubmit}
        render={({ handleSubmit, submitting, values }) => (
          <Form
            className="grid gap-3 rounded-app border border-app-border bg-app-surface-muted p-3 lg:grid-cols-[150px_minmax(140px,1fr)_180px_minmax(160px,1fr)_140px_auto] lg:items-end"
            onSubmit={handleSubmit}
          >
            <Field<string> name="source">
              {({ input, meta }) => (
                <Select
                  {...input}
                  error={meta.touched && meta.error ? meta.error : undefined}
                  label="Source"
                  options={targetingRuleSourceOptions}
                />
              )}
            </Field>
            {values.source === "SEGMENT" ? (
              <Field<string> name="segmentId">
                {({ input, meta }) => (
                  <Select
                    {...input}
                    error={meta.touched && meta.error ? meta.error : undefined}
                    label="Segment"
                    options={[
                      { label: "Select segment", value: "" },
                      ...targetingRules.segmentOptions.map((segment) => ({
                        label: segment.name,
                        value: segment.id
                      }))
                    ]}
                  />
                )}
              </Field>
            ) : (
              <>
                <Field<string> name="attribute">
                  {({ input, meta }) => (
                    <TextInput
                      {...input}
                      autoComplete="off"
                      error={meta.touched && meta.error ? meta.error : undefined}
                      label="Attribute"
                      placeholder="country"
                    />
                  )}
                </Field>
                <Field<string> name="operator">
                  {({ input, meta }) => (
                    <Select
                      {...input}
                      error={meta.touched && meta.error ? meta.error : undefined}
                      label="Operator"
                      options={targetingRuleOperatorOptions}
                    />
                  )}
                </Field>
                <Field<string> name="comparisonValue">
                  {({ input, meta }) => (
                    <TextInput
                      {...input}
                      autoComplete="off"
                      error={meta.touched && meta.error ? meta.error : undefined}
                      label="Value"
                      placeholder="IT"
                    />
                  )}
                </Field>
              </>
            )}
            <Field<string> name="resultValue">
              {({ input, meta }) => (
                <Select
                  {...input}
                  error={meta.touched && meta.error ? meta.error : undefined}
                  label="Serve"
                  options={[
                    { label: "true", value: "true" },
                    { label: "false", value: "false" }
                  ]}
                />
              )}
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={targetingRules.isCreatingRule || targetingRules.isUpdatingRule || submitting}
                type="submit"
              >
                <span className="inline-flex items-center gap-2">
                  {editingRule ? <Pencil aria-hidden="true" className="h-4 w-4" /> : <Plus aria-hidden="true" className="h-4 w-4" />}
                  {editingRule ? "Save" : "Add"}
                </span>
              </Button>
              {editingRule ? (
                <Button onClick={() => setEditingRuleId(null)} type="button" variant="secondary">
                  <span className="inline-flex items-center gap-2">
                    <X aria-hidden="true" className="h-4 w-4" />
                    Cancel
                  </span>
                </Button>
              ) : null}
            </div>
          </Form>
        )}
        validate={validateRule}
      />

      {targetingRules.rulesError ? (
        <Alert tone="danger" title="Targeting rules could not be loaded">
          Rules for {config.environmentName} are unavailable.
        </Alert>
      ) : null}
      {targetingRules.isLoadingRules ? <Skeleton rows={2} /> : null}
      {!targetingRules.isLoadingRules && !targetingRules.rulesError && targetingRules.rules.length === 0 ? (
        <EmptyState description="Add a rule such as country equals IT." icon={Plus} title="No targeting rules" />
      ) : null}
      {!targetingRules.isLoadingRules && !targetingRules.rulesError && targetingRules.rules.length > 0 ? (
        <DataList>
          {targetingRules.rules.map((rule, index) => (
            <DataRow
              actions={
                <>
                  <Button
                    disabled={targetingRules.isReorderingRules || index === 0}
                    onClick={() => void onMoveRule(rule.id, "up")}
                    title="Move rule up"
                    type="button"
                    variant="secondary"
                  >
                    <ArrowUp aria-hidden="true" className="h-4 w-4" />
                  </Button>
                  <Button
                    disabled={targetingRules.isReorderingRules || index === targetingRules.rules.length - 1}
                    onClick={() => void onMoveRule(rule.id, "down")}
                    title="Move rule down"
                    type="button"
                    variant="secondary"
                  >
                    <ArrowDown aria-hidden="true" className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => setEditingRuleId(rule.id)} title="Edit rule" type="button" variant="secondary">
                    <Pencil aria-hidden="true" className="h-4 w-4" />
                  </Button>
                  <Button
                    disabled={targetingRules.isDeletingRule}
                    onClick={() => setPendingDeleteRule(rule)}
                    title="Delete rule"
                    type="button"
                    variant="secondary"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                  </Button>
                </>
              }
              key={rule.id}
            >
              <div className="flex min-w-0 flex-col gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="info">#{rule.sortOrder}</Badge>
                  {rule.source === "SEGMENT" ? (
                    <>
                      <Badge tone="primary">segment</Badge>
                      <span className="text-sm font-semibold text-app-text">{rule.segment?.name ?? "Unknown segment"}</span>
                      {rule.segment ? <Badge>{rule.segment.key}</Badge> : null}
                    </>
                  ) : (
                    <>
                      <Badge>{rule.attribute ?? "attribute"}</Badge>
                      <span className="text-sm font-semibold text-app-text">
                        {rule.operator ? targetingRuleOperatorLabels[rule.operator] : "matches"}
                      </span>
                      <Badge tone="primary">{rule.comparisonValue === null ? "" : formatComparisonValue(rule.comparisonValue)}</Badge>
                    </>
                  )}
                  <Badge tone={rule.resultValue ? "success" : "neutral"}>serve {rule.resultValue ? "true" : "false"}</Badge>
                </div>
              </div>
            </DataRow>
          ))}
        </DataList>
      ) : null}

      <ConfirmDialog
        confirmLabel="Delete rule"
        description={`Delete the ${pendingDeleteRule?.segment?.name ?? pendingDeleteRule?.attribute ?? "selected"} targeting rule. Evaluations will skip it immediately.`}
        isConfirming={targetingRules.isDeletingRule}
        onCancel={() => setPendingDeleteRule(null)}
        onConfirm={() => void onConfirmDeleteRule()}
        open={Boolean(pendingDeleteRule)}
        title="Delete targeting rule"
      />
    </div>
  );
};

export default TargetingRuleManager;
