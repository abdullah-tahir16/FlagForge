import { Field, Form as FinalForm } from "react-final-form";
import { Activity, Filter, ScrollText } from "lucide-react";
import type { AuditLog } from "../../../core/types/Audit";
import type { CursorPaginationMetadata } from "../../../core/types/Pagination";
import { auditActions, auditResourceTypes } from "../../../core/types/Audit";
import Alert from "../Common/Alert";
import Badge from "../Common/Badge";
import Button from "../Common/Button";
import DataList from "../Common/DataList";
import DataRow from "../Common/DataRow";
import EmptyState from "../Common/EmptyState";
import Form from "../Common/Form";
import PaginationControls from "../Common/PaginationControls";
import Select from "../Common/Select";
import Skeleton from "../Common/Skeleton";
import TextInput from "../Common/TextInput";
import Toolbar from "../Common/Toolbar";
import { auditActionLabels, auditActionTone, auditResourceLabels } from "../../hooks/Audit/data";
import { formatAuditTime, formatSnapshot, getAuditRowSubtitle, getAuditRowTitle } from "../../hooks/Audit/fns";

interface Props {
  auditErrorMessage?: string | null;
  auditLogs: AuditLog[];
  canGoNext: boolean;
  canGoPrevious: boolean;
  filterInitialValues: Record<string, string>;
  isLoadingAuditLogs: boolean;
  isRefetchingAuditLogs: boolean;
  onApplyFilters: (values: Record<string, string>) => Promise<void>;
  onClearFilters: () => void;
  onNextPage: () => void;
  onPreviousPage: () => void;
  pageNumber: number;
  pagination: CursorPaginationMetadata;
  validateFilters: (values: Record<string, string>) => Partial<Record<string, string>>;
}

const Audit = ({
  auditErrorMessage,
  auditLogs,
  canGoNext,
  canGoPrevious,
  filterInitialValues,
  isLoadingAuditLogs,
  isRefetchingAuditLogs,
  onApplyFilters,
  onClearFilters,
  onNextPage,
  onPreviousPage,
  pageNumber,
  pagination,
  validateFilters
}: Props) => (
  <section className="min-w-0">
    <Toolbar
      actions={
        <Badge tone={isRefetchingAuditLogs ? "warning" : "primary"}>
          {isRefetchingAuditLogs ? "Refreshing" : `${auditLogs.length} visible`}
        </Badge>
      }
    >
      Organization timeline
    </Toolbar>

    <div className="mb-4 rounded-app border border-app-border bg-app-surface px-4 py-4">
      <FinalForm
        initialValues={filterInitialValues}
        onSubmit={onApplyFilters}
        render={({ handleSubmit, submitting }) => (
          <Form className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_240px_auto] lg:items-end" onSubmit={handleSubmit}>
            <Field<string> name="projectId">
              {({ input, meta }) => (
                <TextInput
                  {...input}
                  autoComplete="off"
                  error={meta.touched && meta.error ? meta.error : undefined}
                  label="Project id"
                  placeholder="Filter by project id"
                />
              )}
            </Field>
            <Field<string> name="resourceType">
              {({ input, meta }) => (
                <Select
                  {...input}
                  error={meta.touched && meta.error ? meta.error : undefined}
                  label="Resource"
                  options={[
                    { label: "All resources", value: "" },
                    ...auditResourceTypes.map((resourceType) => ({
                      label: auditResourceLabels[resourceType],
                      value: resourceType
                    }))
                  ]}
                />
              )}
            </Field>
            <Field<string> name="action">
              {({ input, meta }) => (
                <Select
                  {...input}
                  error={meta.touched && meta.error ? meta.error : undefined}
                  label="Action"
                  options={[
                    { label: "All actions", value: "" },
                    ...auditActions.map((action) => ({
                      label: auditActionLabels[action],
                      value: action
                    }))
                  ]}
                />
              )}
            </Field>
            <div className="flex flex-wrap gap-2">
              <Button disabled={submitting} type="submit">
                <span className="inline-flex items-center gap-2">
                  <Filter aria-hidden="true" className="h-4 w-4" />
                  Apply
                </span>
              </Button>
              <Button onClick={onClearFilters} type="button" variant="secondary">
                Clear
              </Button>
            </div>
          </Form>
        )}
        validate={validateFilters}
      />
    </div>

    {auditErrorMessage ? (
      <div className="mb-4">
        <Alert tone="danger" title="Audit logs could not be loaded">
          {auditErrorMessage}
        </Alert>
      </div>
    ) : null}

    {isLoadingAuditLogs ? <Skeleton rows={6} /> : null}

    {!isLoadingAuditLogs && !auditErrorMessage && auditLogs.length === 0 ? (
      <EmptyState
        description="Create, update, delete, or revoke a management resource to add entries to this timeline."
        icon={ScrollText}
        title="No audit entries"
      />
    ) : null}

    {!isLoadingAuditLogs && !auditErrorMessage && auditLogs.length > 0 ? (
      <DataList>
        {auditLogs.map((auditLog) => (
          <DataRow
            actions={
              <div className="flex flex-col gap-2 text-left md:items-end md:text-right">
                <span className="text-sm font-semibold text-app-text">{formatAuditTime(auditLog.createdAt)}</span>
                <span className="text-xs text-app-text-muted">{auditLog.ipAddress ?? "No IP recorded"}</span>
              </div>
            }
            key={auditLog.id}
          >
            <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.8fr)] lg:items-start">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={auditActionTone(auditLog.action)}>{auditActionLabels[auditLog.action]}</Badge>
                  <Badge>{auditResourceLabels[auditLog.resourceType]}</Badge>
                </div>
                <div className="mt-2 flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-app border border-app-border bg-app-primary-muted text-app-primary">
                    <Activity aria-hidden="true" className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-app-text">{getAuditRowTitle(auditLog)}</p>
                    <p className="mt-1 text-sm text-app-text-muted">{getAuditRowSubtitle(auditLog)}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {auditLog.projectId ? <Badge tone="primary">Project {auditLog.projectId}</Badge> : null}
                      {auditLog.environmentId ? <Badge tone="info">Environment {auditLog.environmentId}</Badge> : null}
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid gap-2 rounded-app-sm border border-app-border bg-app-surface-muted px-3 py-2 text-xs leading-5 text-app-text-muted">
                <p>
                  <span className="font-semibold text-app-text">Old:</span> {formatSnapshot(auditLog.oldValue)}
                </p>
                <p>
                  <span className="font-semibold text-app-text">New:</span> {formatSnapshot(auditLog.newValue)}
                </p>
              </div>
            </div>
          </DataRow>
        ))}
      </DataList>
    ) : null}

    <PaginationControls
      canGoNext={canGoNext}
      canGoPrevious={canGoPrevious}
      isLoading={isLoadingAuditLogs || isRefetchingAuditLogs}
      onNextPage={onNextPage}
      onPreviousPage={onPreviousPage}
      pageLabel={`Page ${pageNumber} · ${auditLogs.length} of ${pagination.limit} shown`}
    />
  </section>
);

export default Audit;
