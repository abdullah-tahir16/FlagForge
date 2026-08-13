import type { TargetingComparisonValue } from "../targeting-rule-comparison-value";
import { TargetingRuleOperator } from "../targeting-rule-operator.enum";

export interface TargetingRuleResponse {
  attribute: string;
  comparisonValue: TargetingComparisonValue;
  createdAt: Date;
  environmentFlagConfigId: string;
  id: string;
  operator: TargetingRuleOperator;
  resultValue: boolean;
  sortOrder: number;
  updatedAt: Date;
}
