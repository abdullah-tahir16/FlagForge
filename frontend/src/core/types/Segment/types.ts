import type { CursorPaginatedList, CursorPaginationParams } from "../Pagination";
import type { TargetingComparisonValue, TargetingRuleOperator } from "../TargetingRules";

export const segmentMatchModes = ["MATCH_ALL", "MATCH_ANY"] as const;

export type SegmentMatchMode = (typeof segmentMatchModes)[number];

export interface SegmentCondition {
  attribute: string;
  comparisonValue: TargetingComparisonValue;
  createdAt: string;
  id: string;
  operator: TargetingRuleOperator;
  segmentId: string;
  sortOrder: number;
  updatedAt: string;
}

export interface Segment {
  conditions: SegmentCondition[];
  createdAt: string;
  description: string | null;
  id: string;
  key: string;
  matchMode: SegmentMatchMode;
  name: string;
  projectId: string;
  updatedAt: string;
}

export interface CreateSegmentInput {
  description?: string | null;
  matchMode?: SegmentMatchMode;
  name: string;
}

export type UpdateSegmentInput = Partial<CreateSegmentInput>;

export interface CreateSegmentConditionInput {
  attribute: string;
  comparisonValue: TargetingComparisonValue;
  operator: TargetingRuleOperator;
}

export type UpdateSegmentConditionInput = Partial<CreateSegmentConditionInput>;

export interface ReorderSegmentConditionsInput {
  conditionIds: string[];
}

export type SegmentListParams = CursorPaginationParams;
export type SegmentList = CursorPaginatedList<Segment>;
