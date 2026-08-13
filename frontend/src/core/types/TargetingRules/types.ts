export const targetingRuleOperators = [
  "EQUALS",
  "NOT_EQUALS",
  "CONTAINS",
  "NOT_CONTAINS",
  "STARTS_WITH",
  "ENDS_WITH",
  "IN",
  "NOT_IN",
  "GREATER_THAN",
  "GREATER_THAN_OR_EQUAL",
  "LESS_THAN",
  "LESS_THAN_OR_EQUAL"
] as const;

export type TargetingRuleOperator = (typeof targetingRuleOperators)[number];
export type TargetingPrimitive = boolean | number | string | null;
export type TargetingComparisonValue = TargetingPrimitive | TargetingPrimitive[];
export const targetingRuleSources = ["ATTRIBUTE", "SEGMENT"] as const;
export type TargetingRuleSource = (typeof targetingRuleSources)[number];

export interface TargetingRuleSegment {
  id: string;
  key: string;
  name: string;
}

export interface TargetingRule {
  attribute: string | null;
  comparisonValue: TargetingComparisonValue | null;
  createdAt: string;
  environmentFlagConfigId: string;
  id: string;
  operator: TargetingRuleOperator | null;
  resultValue: boolean;
  segment: TargetingRuleSegment | null;
  segmentId: string | null;
  sortOrder: number;
  source: TargetingRuleSource;
  updatedAt: string;
}

export interface CreateTargetingRuleInput {
  attribute?: string;
  comparisonValue?: TargetingComparisonValue;
  operator?: TargetingRuleOperator;
  resultValue: boolean;
  segmentId?: string;
  source?: TargetingRuleSource;
}

export type UpdateTargetingRuleInput = Partial<CreateTargetingRuleInput>;

export interface ReorderTargetingRulesInput {
  ruleIds: string[];
}
