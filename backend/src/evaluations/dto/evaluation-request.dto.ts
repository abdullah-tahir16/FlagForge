export type SdkEvaluationContextValue = boolean | number | string | null;

export interface SdkEvaluationRequest {
  userId?: string;
  [attribute: string]: SdkEvaluationContextValue | undefined;
}
