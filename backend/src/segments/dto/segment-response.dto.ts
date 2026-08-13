import type { CursorPaginatedResponse } from "../../common/pagination/cursor-pagination";
import type { TargetingComparisonValue } from "../../targeting-rules/targeting-rule-comparison-value";
import { TargetingRuleOperator } from "../../targeting-rules/targeting-rule-operator.enum";
import { SegmentMatchMode } from "../segment-match-mode.enum";

export interface SegmentConditionResponse {
  attribute: string;
  comparisonValue: TargetingComparisonValue;
  createdAt: Date;
  id: string;
  operator: TargetingRuleOperator;
  segmentId: string;
  sortOrder: number;
  updatedAt: Date;
}

export interface SegmentResponse {
  conditions: SegmentConditionResponse[];
  createdAt: Date;
  description: string | null;
  id: string;
  key: string;
  matchMode: SegmentMatchMode;
  name: string;
  projectId: string;
  updatedAt: Date;
}

export type SegmentListResponse = CursorPaginatedResponse<SegmentResponse>;
