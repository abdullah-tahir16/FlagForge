export type EvaluationReason = "STATIC" | "DISABLED" | "FLAG_NOT_FOUND" | "CONFIG_NOT_FOUND";

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
  value: boolean;
}

export interface AllEvaluationFlagReason {
  reason: EvaluationReason;
  value: boolean;
}

export interface AllEvaluationsResponse {
  environment: EvaluationEnvironmentResponse;
  evaluatedAt: Date;
  flags: Record<string, boolean>;
  reasons: Record<string, AllEvaluationFlagReason>;
}
