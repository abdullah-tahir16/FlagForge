export type EvaluationReason =
  | "STATIC"
  | "DISABLED"
  | "FLAG_NOT_FOUND"
  | "CONFIG_NOT_FOUND"
  | "SEGMENT_TARGETING_MATCH"
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
  segment?: EvaluationSegmentResponse;
  targetingRule?: EvaluationTargetingRuleResponse;
  value: boolean;
}

export interface AllEvaluationFlagReason {
  reason: EvaluationReason;
  segment?: EvaluationSegmentResponse;
  targetingRule?: EvaluationTargetingRuleResponse;
  value: boolean;
}

export interface EvaluationTargetingRuleResponse {
  attribute?: string;
  id: string;
  operator?: string;
  source: string;
}

export interface EvaluationSegmentResponse {
  id: string;
  key: string;
  name: string;
}

export interface AllEvaluationsResponse {
  environment: EvaluationEnvironmentResponse;
  evaluatedAt: Date;
  flags: Record<string, boolean>;
  reasons: Record<string, AllEvaluationFlagReason>;
}
