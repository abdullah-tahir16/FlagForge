import {
  assertAllEvaluationsResponse,
  assertSdkKey,
  assertSingleEvaluationResponse,
  createAbortSignal,
  DEFAULT_TIMEOUT_MS,
  FlagForgeRequestError,
  normalizeApiUrl,
  resolveFetch,
  sanitizeContext,
  toFallbackReason
} from "./fns";
import type {
  FlagForgeAllEvaluationResult,
  FlagForgeClient,
  FlagForgeClientOptions,
  FlagForgeEvaluateAllOptions,
  FlagForgeEvaluateOptions,
  FlagForgeEvaluationContext,
  FlagForgeFetch,
  FlagForgeSdkError,
  FlagForgeSingleEvaluationResult
} from "./types";

interface NormalizedClientOptions {
  apiUrl: string;
  defaultValue: boolean;
  fetch: FlagForgeFetch;
  sdkKey: string;
  timeoutMs: number;
}

export const createFlagForgeClient = (options: FlagForgeClientOptions): FlagForgeClient => {
  const normalized: NormalizedClientOptions = {
    apiUrl: normalizeApiUrl(options.apiUrl),
    defaultValue: options.defaultValue ?? false,
    fetch: resolveFetch(options.fetch),
    sdkKey: assertSdkKey(options.sdkKey),
    timeoutMs: options.timeoutMs ?? DEFAULT_TIMEOUT_MS
  };

  return {
    evaluate: (flagKey, context, evaluateOptions) => evaluate(normalized, flagKey, context, evaluateOptions),
    evaluateAll: (context, evaluateOptions) => evaluateAll(normalized, context, evaluateOptions),
    isEnabled: async (flagKey, context, defaultValue) => {
      const result = await evaluate(normalized, flagKey, context, { defaultValue });

      return result.value;
    }
  };
};

const evaluate = async (
  options: NormalizedClientOptions,
  flagKey: string,
  context: FlagForgeEvaluationContext = {},
  evaluateOptions: FlagForgeEvaluateOptions = {}
): Promise<FlagForgeSingleEvaluationResult> => {
  const defaultValue = evaluateOptions.defaultValue ?? options.defaultValue;

  try {
    const payload = await request(options, `/sdk/evaluate/${encodeURIComponent(flagKey)}`, context);
    const response = assertSingleEvaluationResponse(payload);

    return {
      ...response,
      fallback: false
    };
  } catch (error) {
    return {
      error: toSdkError(toFallbackReason(error)),
      fallback: true,
      key: flagKey,
      reason: "SDK_FALLBACK",
      value: defaultValue
    };
  }
};

const evaluateAll = async (
  options: NormalizedClientOptions,
  context: FlagForgeEvaluationContext = {},
  evaluateOptions: FlagForgeEvaluateAllOptions = {}
): Promise<FlagForgeAllEvaluationResult> => {
  try {
    const payload = await request(options, "/sdk/evaluate", context);
    const response = assertAllEvaluationsResponse(payload);

    return {
      ...response,
      fallback: false
    };
  } catch (error) {
    return {
      error: toSdkError(toFallbackReason(error)),
      fallback: true,
      flags: evaluateOptions.fallbackFlags ?? {},
      reasons: {}
    };
  }
};

const request = async (
  options: NormalizedClientOptions,
  path: string,
  context: FlagForgeEvaluationContext
): Promise<unknown> => {
  const { cleanup, signal } = createAbortSignal(options.timeoutMs);

  try {
    const response = await options.fetch(`${options.apiUrl}${path}`, {
      body: JSON.stringify(sanitizeContext(context)),
      headers: {
        "Content-Type": "application/json",
        "X-FlagForge-Key": options.sdkKey
      },
      method: "POST",
      signal
    });

    if (!response.ok) {
      throw new FlagForgeRequestError(
        response.status === 401 ? "UNAUTHORIZED" : "HTTP_ERROR",
        `FlagForge request failed with status ${response.status}`,
        response.status
      );
    }

    return response.json();
  } finally {
    cleanup();
  }
};

const toSdkError = (error: FlagForgeRequestError): FlagForgeSdkError => ({
  message: error.message,
  reason: error.reason,
  status: error.status
});
