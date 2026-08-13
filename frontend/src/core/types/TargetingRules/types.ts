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

export interface TargetingRule {
  attribute: string;
  comparisonValue: TargetingComparisonValue;
  createdAt: string;
  environmentFlagConfigId: string;
  id: string;
  operator: TargetingRuleOperator;
  resultValue: boolean;
  sortOrder: number;
  updatedAt: string;
}

export interface CreateTargetingRuleInput {
  attribute: string;
  comparisonValue: TargetingComparisonValue;
  operator: TargetingRuleOperator;
  resultValue: boolean;
}

export type UpdateTargetingRuleInput = Partial<CreateTargetingRuleInput>;

export interface ReorderTargetingRulesInput {
  ruleIds: string[];
}
