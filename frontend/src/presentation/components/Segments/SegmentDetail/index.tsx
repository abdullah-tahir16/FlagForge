import { Field, Form as FinalForm } from "react-final-form";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2, UsersRound, X } from "lucide-react";
import type { Project } from "../../../../core/types/Project";
import type { Segment, SegmentCondition } from "../../../../core/types/Segment";
import Alert from "../../Common/Alert";
import Badge from "../../Common/Badge";
import Button from "../../Common/Button";
import ConfirmDialog from "../../Common/ConfirmDialog";
import DataList from "../../Common/DataList";
import DataRow from "../../Common/DataRow";
import EmptyState from "../../Common/EmptyState";
import Form from "../../Common/Form";
import Panel from "../../Common/Panel";
import Select from "../../Common/Select";
import Skeleton from "../../Common/Skeleton";
import TextArea from "../../Common/TextArea";
import TextInput from "../../Common/TextInput";
import { segmentMatchModeLabels, segmentMatchModeOptions, segmentOperatorLabels, segmentOperatorOptions } from "../../../hooks/Segments/data";
import { formatSegmentComparisonValue } from "../../../hooks/Segments/fns";

interface Props {
  conditionErrorMessage?: string | null;
  conditionInitialValues: Record<string, string>;
  deletingConditionId?: string;
  editingCondition?: SegmentCondition;
  isConditionDeleteDialogOpen: boolean;
  isCreatingCondition: boolean;
  isDeletingCondition: boolean;
  isLoadingProject: boolean;
  isLoadingSegment: boolean;
  isReorderingConditions: boolean;
  isUpdatingCondition: boolean;
  isUpdatingSegment: boolean;
  onCancelDeleteCondition: () => void;
  onCancelEditCondition: () => void;
  onConditionSubmit: (values: Record<string, string>) => Promise<void>;
  onConfirmDeleteCondition: () => Promise<void>;
  onMoveCondition: (conditionId: string, direction: "down" | "up") => Promise<void>;
  onRequestDeleteCondition: (condition: SegmentCondition) => void;
  onRequestEditCondition: (condition: SegmentCondition) => void;
  onSegmentSubmit: (values: Record<string, string>) => Promise<void>;
  pendingDeleteCondition?: SegmentCondition | null;
  project?: Project;
  projectErrorMessage?: string | null;
  segment?: Segment;
  segmentErrorMessage?: string | null;
  segmentInitialValues: Record<string, string>;
  updateSegmentErrorMessage?: string | null;
  validateCondition: (values: Record<string, string>) => Partial<Record<string, string>>;
  validateSegment: (values: Record<string, string>) => Partial<Record<string, string>>;
}

const SegmentDetail = ({
  conditionErrorMessage,
  conditionInitialValues,
  deletingConditionId,
  editingCondition,
  isConditionDeleteDialogOpen,
  isCreatingCondition,
  isDeletingCondition,
  isLoadingProject,
  isLoadingSegment,
  isReorderingConditions,
  isUpdatingCondition,
  isUpdatingSegment,
  onCancelDeleteCondition,
  onCancelEditCondition,
  onConditionSubmit,
  onConfirmDeleteCondition,
  onMoveCondition,
  onRequestDeleteCondition,
  onRequestEditCondition,
  onSegmentSubmit,
  pendingDeleteCondition,
  project,
  projectErrorMessage,
  segment,
  segmentErrorMessage,
  segmentInitialValues,
  updateSegmentErrorMessage,
  validateCondition,
  validateSegment
}: Props) => {
  if (isLoadingProject || isLoadingSegment) {
    return <Skeleton rows={6} />;
  }

  if (projectErrorMessage || !project) {
    return (
      <Alert tone="danger" title="Project could not be loaded">
        {projectErrorMessage ?? "Project was not found."}
      </Alert>
    );
  }

  if (segmentErrorMessage || !segment) {
    return (
      <Alert tone="danger" title="Segment could not be loaded">
        {segmentErrorMessage ?? "Segment was not found."}
      </Alert>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
      <Panel className="h-fit p-5">
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge tone="primary">{segment.key}</Badge>
          <Badge tone="info">{segmentMatchModeLabels[segment.matchMode]}</Badge>
        </div>
        <h2 className="text-lg font-semibold text-app-text">Segment metadata</h2>
        <p className="mt-1 text-sm text-app-text-muted">Key remains stable when the display name changes.</p>
        <FinalForm
          initialValues={segmentInitialValues}
          onSubmit={onSegmentSubmit}
          render={({ handleSubmit, submitting }) => (
            <Form className="mt-4 grid gap-4" errorMessage={updateSegmentErrorMessage} onSubmit={handleSubmit}>
              <Field<string> name="name">
                {({ input, meta }) => (
                  <TextInput
                    {...input}
                    autoComplete="off"
                    error={meta.touched && meta.error ? meta.error : undefined}
                    label="Name"
                  />
                )}
              </Field>
              <Field<string> name="description">
                {({ input, meta }) => (
                  <TextArea {...input} error={meta.touched && meta.error ? meta.error : undefined} label="Description" />
                )}
              </Field>
              <Field<string> name="matchMode">
                {({ input, meta }) => (
                  <Select
                    {...input}
                    error={meta.touched && meta.error ? meta.error : undefined}
                    label="Match mode"
                    options={segmentMatchModeOptions}
                  />
                )}
              </Field>
              <Button disabled={isUpdatingSegment || submitting} type="submit">
                <span className="inline-flex items-center gap-2">
                  <Pencil aria-hidden="true" className="h-4 w-4" />
                  Save segment
                </span>
              </Button>
            </Form>
          )}
          validate={validateSegment}
        />
      </Panel>

      <section className="min-w-0">
        <Panel className="mb-5 p-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-app border border-app-border bg-app-primary-muted text-app-primary">
              {editingCondition ? <Pencil aria-hidden="true" className="h-4 w-4" /> : <Plus aria-hidden="true" className="h-4 w-4" />}
            </span>
            <div>
              <h2 className="text-lg font-semibold text-app-text">{editingCondition ? "Edit condition" : "Add condition"}</h2>
              <p className="text-sm text-app-text-muted">Conditions reuse the same operators as direct flag targeting.</p>
            </div>
          </div>
          <FinalForm
            initialValues={conditionInitialValues}
            key={editingCondition?.id ?? "create-segment-condition"}
            onSubmit={onConditionSubmit}
            render={({ handleSubmit, submitting }) => (
              <Form
                className="grid gap-3 lg:grid-cols-[minmax(140px,1fr)_180px_minmax(160px,1fr)_auto] lg:items-end"
                errorMessage={conditionErrorMessage}
                onSubmit={handleSubmit}
              >
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
                      options={segmentOperatorOptions}
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
                <div className="flex flex-wrap gap-2">
                  <Button disabled={isCreatingCondition || isUpdatingCondition || submitting} type="submit">
                    <span className="inline-flex items-center gap-2">
                      {editingCondition ? <Pencil aria-hidden="true" className="h-4 w-4" /> : <Plus aria-hidden="true" className="h-4 w-4" />}
                      {editingCondition ? "Save" : "Add"}
                    </span>
                  </Button>
                  {editingCondition ? (
                    <Button onClick={onCancelEditCondition} type="button" variant="secondary">
                      <span className="inline-flex items-center gap-2">
                        <X aria-hidden="true" className="h-4 w-4" />
                        Cancel
                      </span>
                    </Button>
                  ) : null}
                </div>
              </Form>
            )}
            validate={validateCondition}
          />
        </Panel>

        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-app-text">Conditions</h2>
            <p className="text-sm text-app-text-muted">Ordered conditions define membership for {segment.name}.</p>
          </div>
          <Badge tone="primary">
            {segment.conditions.length} {segment.conditions.length === 1 ? "condition" : "conditions"}
          </Badge>
        </div>
        {segment.conditions.length === 0 ? (
          <EmptyState description="Add the first condition before this segment can match evaluations." icon={UsersRound} title="No conditions" />
        ) : (
          <DataList>
            {segment.conditions.map((condition, index) => (
              <DataRow
                actions={
                  <>
                    <Button
                      disabled={isReorderingConditions || index === 0}
                      onClick={() => void onMoveCondition(condition.id, "up")}
                      title="Move condition up"
                      type="button"
                      variant="secondary"
                    >
                      <ArrowUp aria-hidden="true" className="h-4 w-4" />
                    </Button>
                    <Button
                      disabled={isReorderingConditions || index === segment.conditions.length - 1}
                      onClick={() => void onMoveCondition(condition.id, "down")}
                      title="Move condition down"
                      type="button"
                      variant="secondary"
                    >
                      <ArrowDown aria-hidden="true" className="h-4 w-4" />
                    </Button>
                    <Button onClick={() => onRequestEditCondition(condition)} title="Edit condition" type="button" variant="secondary">
                      <Pencil aria-hidden="true" className="h-4 w-4" />
                    </Button>
                    <Button
                      disabled={isDeletingCondition}
                      onClick={() => onRequestDeleteCondition(condition)}
                      title="Delete condition"
                      type="button"
                      variant="secondary"
                    >
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                    </Button>
                  </>
                }
                key={condition.id}
              >
                <div className="flex min-w-0 flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="info">#{condition.sortOrder}</Badge>
                    <Badge>{condition.attribute}</Badge>
                    <span className="text-sm font-semibold text-app-text">{segmentOperatorLabels[condition.operator]}</span>
                    <Badge tone="primary">{formatSegmentComparisonValue(condition.comparisonValue)}</Badge>
                    {isDeletingCondition && deletingConditionId === condition.id ? <Badge tone="danger">Deleting</Badge> : null}
                  </div>
                </div>
              </DataRow>
            ))}
          </DataList>
        )}
      </section>
      <ConfirmDialog
        confirmLabel="Delete condition"
        description={`Delete ${pendingDeleteCondition?.attribute ?? "this"} condition from ${segment.name}.`}
        isConfirming={isDeletingCondition}
        onCancel={onCancelDeleteCondition}
        onConfirm={() => void onConfirmDeleteCondition()}
        open={isConditionDeleteDialogOpen}
        title="Delete segment condition"
      />
    </div>
  );
};

export default SegmentDetail;
