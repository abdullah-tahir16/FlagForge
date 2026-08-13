import { Activity, BarChart3, Clock, Gauge, Percent, Split, TrendingUp } from "lucide-react";
import type { AnalyticsOverview, AnalyticsRange } from "../../../../core/types/Analytics";
import { analyticsRanges } from "../../../../core/types/Analytics";
import type { Environment } from "../../../../core/types/Environment";
import type { FeatureFlag } from "../../../../core/types/FeatureFlag";
import Alert from "../../Common/Alert";
import Badge from "../../Common/Badge";
import Button from "../../Common/Button";
import EmptyState from "../../Common/EmptyState";
import Panel from "../../Common/Panel";
import Select from "../../Common/Select";
import Skeleton from "../../Common/Skeleton";
import Toolbar from "../../Common/Toolbar";

interface Props {
  analyticsErrorMessage?: string | null;
  environments: Environment[];
  falsePercentage: number;
  featureFlags: FeatureFlag[];
  filters: {
    environmentId: string;
    flagKey: string;
    range: AnalyticsRange;
  };
  hasEvents: boolean;
  isLoadingAnalytics: boolean;
  isRefetchingAnalytics: boolean;
  maxBucketTotal: number;
  maxTopFlagTotal: number;
  onClearFilters: () => void;
  onEnvironmentChange: (environmentId: string) => void;
  onFlagKeyChange: (flagKey: string) => void;
  onRangeChange: (range: AnalyticsRange) => void;
  overview?: AnalyticsOverview;
  truePercentage: number;
}

const rangeLabels: Record<AnalyticsRange, string> = {
  "24h": "Last 24 hours",
  "7d": "Last 7 days",
  "30d": "Last 30 days"
};

const formatBucketLabel = (value: string, range: AnalyticsRange) =>
  new Intl.DateTimeFormat(undefined, {
    day: range === "24h" ? undefined : "2-digit",
    hour: range === "24h" ? "2-digit" : undefined,
    minute: range === "24h" ? "2-digit" : undefined,
    month: range === "24h" ? undefined : "short"
  }).format(new Date(value));

const formatReasonLabel = (reason: string) =>
  reason
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const MetricPanel = ({
  icon: Icon,
  label,
  meta,
  value
}: {
  icon: typeof Activity;
  label: string;
  meta: string;
  value: string;
}) => (
  <Panel className="p-4">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-semibold text-app-text-muted">{label}</p>
        <p className="mt-2 text-2xl font-semibold text-app-text">{value}</p>
      </div>
      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-app border border-app-border bg-app-primary-muted text-app-primary">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
    </div>
    <p className="mt-3 text-xs font-semibold text-app-text-muted">{meta}</p>
  </Panel>
);

const ProjectAnalytics = ({
  analyticsErrorMessage,
  environments,
  falsePercentage,
  featureFlags,
  filters,
  hasEvents,
  isLoadingAnalytics,
  isRefetchingAnalytics,
  maxBucketTotal,
  maxTopFlagTotal,
  onClearFilters,
  onEnvironmentChange,
  onFlagKeyChange,
  onRangeChange,
  overview,
  truePercentage
}: Props) => (
  <section className="min-w-0">
    <Toolbar
      actions={<Badge tone={isRefetchingAnalytics ? "warning" : "primary"}>{isRefetchingAnalytics ? "Refreshing" : rangeLabels[filters.range]}</Badge>}
    >
      Evaluation activity
    </Toolbar>

    <Panel className="mb-5 p-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_220px_auto] lg:items-end">
        <Select
          label="Environment"
          name="environmentId"
          onChange={(event) => onEnvironmentChange(event.target.value)}
          options={[
            { label: "All environments", value: "" },
            ...environments.map((environment) => ({
              label: environment.name,
              value: environment.id
            }))
          ]}
          value={filters.environmentId}
        />
        <Select
          label="Flag"
          name="flagKey"
          onChange={(event) => onFlagKeyChange(event.target.value)}
          options={[
            { label: "All flags", value: "" },
            ...featureFlags.map((flag) => ({
              label: flag.key,
              value: flag.key
            }))
          ]}
          value={filters.flagKey}
        />
        <Select
          label="Range"
          name="range"
          onChange={(event) => onRangeChange(event.target.value as AnalyticsRange)}
          options={analyticsRanges.map((range) => ({
            label: rangeLabels[range],
            value: range
          }))}
          value={filters.range}
        />
        <Button onClick={onClearFilters} type="button" variant="secondary">
          Clear
        </Button>
      </div>
    </Panel>

    {analyticsErrorMessage ? (
      <div className="mb-5">
        <Alert tone="danger" title="Analytics could not be loaded">
          {analyticsErrorMessage}
        </Alert>
      </div>
    ) : null}

    {isLoadingAnalytics ? <Skeleton className="mb-5" rows={6} /> : null}

    {!isLoadingAnalytics && !analyticsErrorMessage && !hasEvents ? (
      <EmptyState
        description="Run SDK single-flag or all-flags evaluations for this project to populate this view."
        icon={BarChart3}
        title="No evaluation activity"
      />
    ) : null}

    {!isLoadingAnalytics && !analyticsErrorMessage && overview && hasEvents ? (
      <div className="grid gap-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricPanel icon={Activity} label="Total evaluations" meta={rangeLabels[filters.range]} value={overview.totalEvaluations.toLocaleString()} />
          <MetricPanel icon={TrendingUp} label="Served true" meta={`${truePercentage}% of traffic`} value={overview.trueCount.toLocaleString()} />
          <MetricPanel icon={Split} label="Served false" meta={`${falsePercentage}% of traffic`} value={overview.falseCount.toLocaleString()} />
          <MetricPanel icon={Gauge} label="Tracked flags" meta="Top flag sample" value={String(overview.topFlags.length)} />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
          <Panel className="p-5">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-app-text">Trend</h2>
                <p className="mt-1 text-sm text-app-text-muted">Evaluations grouped by the selected range.</p>
              </div>
              <Badge tone="info">
                <Clock aria-hidden="true" className="mr-1 h-3.5 w-3.5" />
                {overview.timeBuckets.length} buckets
              </Badge>
            </div>
            <div className="grid gap-3">
              {overview.timeBuckets.map((bucket) => (
                <div className="grid gap-2 sm:grid-cols-[92px_minmax(0,1fr)_72px] sm:items-center" key={bucket.bucketStart}>
                  <span className="text-xs font-semibold text-app-text-muted">{formatBucketLabel(bucket.bucketStart, filters.range)}</span>
                  <div className="h-9 overflow-hidden rounded-app-sm border border-app-border bg-app-surface-muted">
                    <div className="flex h-full min-w-2" style={{ width: `${Math.max(4, (bucket.total / maxBucketTotal) * 100)}%` }}>
                      <span className="h-full bg-app-primary" style={{ width: `${bucket.total > 0 ? (bucket.trueCount / bucket.total) * 100 : 0}%` }} />
                      <span className="h-full flex-1 bg-app-info" />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-app-text">{bucket.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-5">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-app-text">True / false split</h2>
                <p className="mt-1 text-sm text-app-text-muted">Served values across all matching evaluations.</p>
              </div>
              <Percent aria-hidden="true" className="h-5 w-5 text-app-primary" />
            </div>
            <div className="overflow-hidden rounded-app border border-app-border bg-app-surface-muted">
              <div className="flex h-12">
                <span className="bg-app-primary" style={{ width: `${truePercentage}%` }} />
                <span className="flex-1 bg-app-info" />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-app-sm border border-app-border bg-app-surface-muted p-3">
                <p className="text-xs font-semibold text-app-text-muted">True</p>
                <p className="mt-1 text-lg font-semibold text-app-text">{truePercentage}%</p>
              </div>
              <div className="rounded-app-sm border border-app-border bg-app-surface-muted p-3">
                <p className="text-xs font-semibold text-app-text-muted">False</p>
                <p className="mt-1 text-lg font-semibold text-app-text">{falsePercentage}%</p>
              </div>
            </div>
          </Panel>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <Panel className="p-5">
            <h2 className="text-lg font-semibold text-app-text">Top flags</h2>
            <div className="mt-4 grid gap-3">
              {overview.topFlags.map((flag) => (
                <div className="grid gap-2" key={flag.flagKey}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-sm font-semibold text-app-text">{flag.flagKey}</span>
                    <Badge tone="primary">{flag.total.toLocaleString()}</Badge>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-app-surface-muted">
                    <span className="block h-full rounded-full bg-app-primary" style={{ width: `${Math.max(4, (flag.total / maxTopFlagTotal) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel className="p-5">
            <h2 className="text-lg font-semibold text-app-text">Reason breakdown</h2>
            <div className="mt-4 grid gap-3">
              {overview.reasonBreakdown.map((reason) => (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-app-sm border border-app-border bg-app-surface-muted px-3 py-2" key={reason.reason}>
                  <span className="text-sm font-semibold text-app-text">{formatReasonLabel(reason.reason)}</span>
                  <Badge tone="info">{reason.count.toLocaleString()}</Badge>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>
    ) : null}
  </section>
);

export default ProjectAnalytics;
