import type { TargetingComparisonValue } from "../targeting-rule-comparison-value";
import { TargetingRuleOperator } from "../targeting-rule-operator.enum";
import { TargetingRuleSource } from "../targeting-rule-source.enum";

export interface TargetingRuleSegmentResponse {
  id: string;
  key: string;
  name: string;
}

export interface TargetingRuleResponse {
  attribute: string | null;
  comparisonValue: TargetingComparisonValue | null;
  createdAt: Date;
  environmentFlagConfigId: string;
  id: string;
  operator: TargetingRuleOperator | null;
  resultValue: boolean;
  segment: TargetingRuleSegmentResponse | null;
  segmentId: string | null;
  sortOrder: number;
  source: TargetingRuleSource;
  updatedAt: Date;
}
