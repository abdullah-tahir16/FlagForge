import type { EvaluationReason } from "../../evaluations/dto/evaluation-response.dto";
import type { AnalyticsRange } from "./list-analytics-overview.dto";

export interface AnalyticsReasonCount {
  count: number;
  reason: EvaluationReason;
}

export interface AnalyticsTopFlag {
  falseCount: number;
  flagKey: string;
  total: number;
  trueCount: number;
}

export interface AnalyticsTimeBucket {
  bucketStart: Date;
  falseCount: number;
  total: number;
  trueCount: number;
}

export interface AnalyticsOverviewResponse {
  falseCount: number;
  filters: {
    environmentId: string | null;
    flagKey: string | null;
    range: AnalyticsRange;
  };
  reasonBreakdown: AnalyticsReasonCount[];
  timeBuckets: AnalyticsTimeBucket[];
  topFlags: AnalyticsTopFlag[];
  totalEvaluations: number;
  trueCount: number;
}
