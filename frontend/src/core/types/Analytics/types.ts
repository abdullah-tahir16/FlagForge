export const analyticsRanges = ["24h", "7d", "30d"] as const;

export type AnalyticsRange = (typeof analyticsRanges)[number];

export interface AnalyticsFilters {
  environmentId?: string;
  flagKey?: string;
  range?: AnalyticsRange;
}

export interface AnalyticsReasonCount {
  count: number;
  reason: string;
}

export interface AnalyticsTopFlag {
  falseCount: number;
  flagKey: string;
  total: number;
  trueCount: number;
}

export interface AnalyticsTimeBucket {
  bucketStart: string;
  falseCount: number;
  total: number;
  trueCount: number;
}

export interface AnalyticsOverview {
  falseCount: number;
  filters: Required<Pick<AnalyticsFilters, "range">> & Pick<AnalyticsFilters, "environmentId" | "flagKey">;
  reasonBreakdown: AnalyticsReasonCount[];
  timeBuckets: AnalyticsTimeBucket[];
  topFlags: AnalyticsTopFlag[];
  totalEvaluations: number;
  trueCount: number;
}
