export type SdkEvaluationContextPrimitive = boolean | number | string | null;
export type SdkEvaluationContextValue = SdkEvaluationContextPrimitive | SdkEvaluationContextPrimitive[];

export interface SdkEvaluationRequest {
  userId?: string;
  [attribute: string]: SdkEvaluationContextValue | undefined;
}
