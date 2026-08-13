import { Field, Form as FinalForm } from "react-final-form";
import { Link } from "react-router-dom";
import { ExternalLink, Plus, Trash2, UsersRound } from "lucide-react";
import type { Project } from "../../../../core/types/Project";
import type { Segment } from "../../../../core/types/Segment";
import Alert from "../../Common/Alert";
import Badge from "../../Common/Badge";
import Button from "../../Common/Button";
import ConfirmDialog from "../../Common/ConfirmDialog";
import DataList from "../../Common/DataList";
import DataRow from "../../Common/DataRow";
import EmptyState from "../../Common/EmptyState";
import Form from "../../Common/Form";
import PaginationControls from "../../Common/PaginationControls";
import Panel from "../../Common/Panel";
import Select from "../../Common/Select";
import Skeleton from "../../Common/Skeleton";
import TextArea from "../../Common/TextArea";
import TextInput from "../../Common/TextInput";
import Toolbar from "../../Common/Toolbar";
import { segmentMatchModeLabels, segmentMatchModeOptions } from "../../../hooks/Segments/data";

interface Props {
  canGoNext: boolean;
  canGoPrevious: boolean;
  createErrorMessage?: string | null;
  createInitialValues: Record<string, string>;
  deleteErrorMessage?: string | null;
  deletingSegmentId?: string;
  isCreatingSegment: boolean;
  isDeletingSegment: boolean;
  isLoadingProject: boolean;
  isLoadingSegments: boolean;
  onCancelDeleteSegment: () => void;
  onConfirmDeleteSegment: () => Promise<void>;
  onCreateSegmentSubmit: (values: Record<string, string>) => Promise<void>;
  onNextPage: () => void;
  onPreviousPage: () => void;
  onRequestDeleteSegment: (segment: Segment) => void;
  pageLabel: string;
  pendingDeleteSegment?: Segment | null;
  project?: Project;
  projectErrorMessage?: string | null;
  segments: Segment[];
  segmentsErrorMessage?: string | null;
  validateSegment: (values: Record<string, string>) => Partial<Record<string, string>>;
}

const ProjectSegmentList = ({
  canGoNext,
  canGoPrevious,
  createErrorMessage,
  createInitialValues,
  deleteErrorMessage,
  deletingSegmentId,
  isCreatingSegment,
  isDeletingSegment,
  isLoadingProject,
  isLoadingSegments,
  onCancelDeleteSegment,
  onConfirmDeleteSegment,
  onCreateSegmentSubmit,
  onNextPage,
  onPreviousPage,
  onRequestDeleteSegment,
  pageLabel,
  pendingDeleteSegment,
  project,
  projectErrorMessage,
  segments,
  segmentsErrorMessage,
  validateSegment
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
            <h2 className="text-lg font-semibold text-app-text">Create segment</h2>
            <p className="text-sm text-app-text-muted">Reusable project cohort for flag targeting.</p>
          </div>
        </div>
        <FinalForm
          initialValues={createInitialValues}
          onSubmit={onCreateSegmentSubmit}
          render={({ handleSubmit, submitting }) => (
            <Form className="grid gap-4" errorMessage={createErrorMessage} onSubmit={handleSubmit}>
              <Field<string> name="name">
                {({ input, meta }) => (
                  <TextInput
                    {...input}
                    autoComplete="off"
                    error={meta.touched && meta.error ? meta.error : undefined}
                    label="Name"
                    placeholder="Premium Italian Users"
                  />
                )}
              </Field>
              <Field<string> name="description">
                {({ input, meta }) => (
                  <TextArea
                    {...input}
                    error={meta.touched && meta.error ? meta.error : undefined}
                    label="Description"
                    placeholder="Who belongs in this segment"
                  />
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
              <Button disabled={isCreatingSegment || submitting} type="submit">
                <span className="inline-flex items-center gap-2">
                  <Plus aria-hidden="true" className="h-4 w-4" />
                  Create segment
                </span>
              </Button>
            </Form>
          )}
          validate={validateSegment}
        />
      </Panel>

      <section className="min-w-0">
        <Toolbar
          actions={
            <Badge tone="primary">
              {segments.length} {segments.length === 1 ? "visible" : "visible"}
            </Badge>
          }
        >
          Segments for {project.name}
        </Toolbar>
        {segmentsErrorMessage ? (
          <Alert tone="danger" title="Segments could not be loaded">
            {segmentsErrorMessage}
          </Alert>
        ) : null}
        {deleteErrorMessage ? (
          <div className="mb-3">
            <Alert tone="danger" title="Segment could not be deleted">
              {deleteErrorMessage}
            </Alert>
          </div>
        ) : null}
        {isLoadingSegments ? <Skeleton rows={4} /> : null}
        {!isLoadingSegments && !segmentsErrorMessage && segments.length === 0 ? (
          <EmptyState
            description="Create a reusable segment, then reference it from flag targeting rules."
            icon={UsersRound}
            title="No segments yet"
          />
        ) : null}
        {!isLoadingSegments && !segmentsErrorMessage && segments.length > 0 ? (
          <>
            <DataList>
              {segments.map((segment) => (
                <DataRow
                  actions={
                    <>
                      <Link
                        className="inline-flex min-h-11 items-center gap-2 rounded-app border border-app-border bg-app-surface px-3 py-2.5 text-sm font-semibold text-app-text transition duration-app hover:border-app-primary/50 hover:bg-app-surface-muted focus:outline-none focus:ring-2 focus:ring-app-focus focus:ring-offset-2"
                        to={`/projects/${project.id}/segments/${segment.id}`}
                      >
                        <ExternalLink aria-hidden="true" className="h-4 w-4" />
                        Open
                      </Link>
                      <Button
                        disabled={isDeletingSegment}
                        onClick={() => onRequestDeleteSegment(segment)}
                        title={`Delete ${segment.name}`}
                        type="button"
                        variant="secondary"
                      >
                        <span className="inline-flex items-center gap-2">
                          <Trash2 aria-hidden="true" className="h-4 w-4" />
                          {isDeletingSegment && deletingSegmentId === segment.id ? "Deleting" : "Delete"}
                        </span>
                      </Button>
                    </>
                  }
                  key={segment.id}
                >
                  <div className="min-w-0">
                    <Link
                      className="truncate text-base font-semibold text-app-text hover:text-app-primary"
                      to={`/projects/${project.id}/segments/${segment.id}`}
                    >
                      {segment.name}
                    </Link>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <Badge>{segment.key}</Badge>
                      <Badge tone="info">{segmentMatchModeLabels[segment.matchMode]}</Badge>
                      <span className="text-sm text-app-text-muted">{segment.description ?? "No description"}</span>
                    </div>
                  </div>
                </DataRow>
              ))}
            </DataList>
            <PaginationControls
              canGoNext={canGoNext}
              canGoPrevious={canGoPrevious}
              isLoading={isLoadingSegments}
              onNextPage={onNextPage}
              onPreviousPage={onPreviousPage}
              pageLabel={pageLabel}
            />
          </>
        ) : null}
      </section>
      <ConfirmDialog
        confirmLabel="Delete segment"
        description={`Delete ${pendingDeleteSegment?.name ?? "this segment"}. Referenced segments cannot be deleted.`}
        isConfirming={isDeletingSegment}
        onCancel={onCancelDeleteSegment}
        onConfirm={() => void onConfirmDeleteSegment()}
        open={Boolean(pendingDeleteSegment)}
        title="Delete segment"
      />
    </div>
  );
};

export default ProjectSegmentList;
