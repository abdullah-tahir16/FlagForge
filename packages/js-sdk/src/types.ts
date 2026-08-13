export type FlagForgeContextValue = string | number | boolean | null;

export interface FlagForgeEvaluationContext {
  userId?: string;
  [key: string]: FlagForgeContextValue | undefined;
}

export interface FlagForgeClientOptions {
  apiUrl: string;
  defaultValue?: boolean;
  fetch?: FlagForgeFetch;
  sdkKey: string;
  timeoutMs?: number;
}

export interface FlagForgeFetch {
  (input: string | URL, init?: FlagForgeFetchInit): Promise<FlagForgeFetchResponse>;
}

export interface FlagForgeFetchInit {
  body?: string;
  headers?: Record<string, string>;
  method?: string;
  signal?: AbortSignal;
}

export interface FlagForgeFetchResponse {
  json(): Promise<unknown>;
  ok: boolean;
  status: number;
}

export type FlagForgeEvaluationReason =
  | "STATIC"
  | "DISABLED"
  | "FLAG_NOT_FOUND"
  | "CONFIG_NOT_FOUND"
  | "SEGMENT_TARGETING_MATCH"
  | "TARGETING_RULE_MATCH"
  | "PERCENTAGE_ROLLOUT"
  | "ROLLOUT_CONTEXT_MISSING";

export type FlagForgeSdkFallbackReason =
  | "NETWORK_ERROR"
  | "TIMEOUT"
  | "UNAUTHORIZED"
  | "HTTP_ERROR"
  | "MALFORMED_RESPONSE"
  | "INVALID_CONFIGURATION";

export interface FlagForgeEnvironment {
  id: string;
  key: string;
  name: string;
  projectId: string;
}

export interface FlagForgeTargetingRuleMetadata {
  attribute?: string;
  id: string;
  operator?: string;
  source: string;
}

export interface FlagForgeSegmentMetadata {
  id: string;
  key: string;
  name: string;
}

export interface FlagForgeSingleEvaluationResponse {
  environment: FlagForgeEnvironment;
  evaluatedAt: string;
  key: string;
  reason: FlagForgeEvaluationReason;
  segment?: FlagForgeSegmentMetadata;
  targetingRule?: FlagForgeTargetingRuleMetadata;
  value: boolean;
}

export interface FlagForgeAllEvaluationFlagReason {
  reason: FlagForgeEvaluationReason;
  segment?: FlagForgeSegmentMetadata;
  targetingRule?: FlagForgeTargetingRuleMetadata;
  value: boolean;
}

export interface FlagForgeAllEvaluationsResponse {
  environment: FlagForgeEnvironment;
  evaluatedAt: string;
  flags: Record<string, boolean>;
  reasons: Record<string, FlagForgeAllEvaluationFlagReason>;
}

export interface FlagForgeSdkError {
  message: string;
  reason: FlagForgeSdkFallbackReason;
  status?: number;
}

export interface FlagForgeSingleFallback {
  error: FlagForgeSdkError;
  fallback: true;
  key: string;
  reason: "SDK_FALLBACK";
  value: boolean;
}

export type FlagForgeSingleEvaluationResult =
  | (FlagForgeSingleEvaluationResponse & {
      fallback: false;
    })
  | FlagForgeSingleFallback;

export interface FlagForgeAllFallback {
  error: FlagForgeSdkError;
  fallback: true;
  flags: Record<string, boolean>;
  reasons: Record<string, FlagForgeAllEvaluationFlagReason>;
}

export type FlagForgeAllEvaluationResult =
  | (FlagForgeAllEvaluationsResponse & {
      fallback: false;
    })
  | FlagForgeAllFallback;

export interface FlagForgeEvaluateOptions {
  defaultValue?: boolean;
}

export interface FlagForgeEvaluateAllOptions {
  fallbackFlags?: Record<string, boolean>;
}

export interface FlagForgeClient {
  evaluate(
    flagKey: string,
    context?: FlagForgeEvaluationContext,
    options?: FlagForgeEvaluateOptions
  ): Promise<FlagForgeSingleEvaluationResult>;
  evaluateAll(
    context?: FlagForgeEvaluationContext,
    options?: FlagForgeEvaluateAllOptions
  ): Promise<FlagForgeAllEvaluationResult>;
  isEnabled(flagKey: string, context?: FlagForgeEvaluationContext, defaultValue?: boolean): Promise<boolean>;
}
