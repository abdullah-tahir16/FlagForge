export type EvaluationReason =
  | "STATIC"
  | "DISABLED"
  | "FLAG_NOT_FOUND"
  | "CONFIG_NOT_FOUND"
  | "TARGETING_RULE_MATCH"
  | "PERCENTAGE_ROLLOUT"
  | "ROLLOUT_CONTEXT_MISSING";

export interface EvaluationEnvironmentResponse {
  id: string;
  key: string;
  name: string;
  projectId: string;
}

export interface SingleEvaluationResponse {
  environment: EvaluationEnvironmentResponse;
  evaluatedAt: Date;
  key: string;
  reason: EvaluationReason;
  targetingRule?: EvaluationTargetingRuleResponse;
  value: boolean;
}

export interface AllEvaluationFlagReason {
  reason: EvaluationReason;
  targetingRule?: EvaluationTargetingRuleResponse;
  value: boolean;
}

export interface EvaluationTargetingRuleResponse {
  attribute: string;
  id: string;
  operator: string;
}

export interface AllEvaluationsResponse {
  environment: EvaluationEnvironmentResponse;
  evaluatedAt: Date;
  flags: Record<string, boolean>;
  reasons: Record<string, AllEvaluationFlagReason>;
}
