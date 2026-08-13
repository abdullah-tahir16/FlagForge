import type {
  FlagForgeAllEvaluationsResponse,
  FlagForgeContextValue,
  FlagForgeEnvironment,
  FlagForgeEvaluationContext,
  FlagForgeFetch,
  FlagForgeSingleEvaluationResponse,
  FlagForgeSdkFallbackReason
} from "./types";

export const DEFAULT_TIMEOUT_MS = 5000;

export class FlagForgeRequestError extends Error {
  readonly reason: FlagForgeSdkFallbackReason;
  readonly status?: number;

  constructor(reason: FlagForgeSdkFallbackReason, message: string, status?: number) {
    super(message);
    this.name = "FlagForgeRequestError";
    this.reason = reason;
    this.status = status;
  }
}

export const normalizeApiUrl = (apiUrl: string): string => {
  const normalized = apiUrl.trim().replace(/\/+$/, "");

  if (!normalized) {
    throw new FlagForgeRequestError("INVALID_CONFIGURATION", "FlagForge apiUrl is required");
  }

  return normalized;
};

export const resolveFetch = (fetchOverride?: FlagForgeFetch): FlagForgeFetch => {
  const fetchImpl = fetchOverride ?? globalThis.fetch;

  if (!fetchImpl) {
    throw new FlagForgeRequestError("INVALID_CONFIGURATION", "FlagForge requires global fetch or an injected fetch implementation");
  }

  return fetchImpl as FlagForgeFetch;
};

export const assertSdkKey = (sdkKey: string): string => {
  const normalized = sdkKey.trim();

  if (!normalized) {
    throw new FlagForgeRequestError("INVALID_CONFIGURATION", "FlagForge sdkKey is required");
  }

  return normalized;
};

export const sanitizeContext = (context: FlagForgeEvaluationContext = {}): Record<string, FlagForgeContextValue> => {
  const sanitized: Record<string, FlagForgeContextValue> = {};

  Object.entries(context).forEach(([key, value]) => {
    if (isContextValue(value)) {
      sanitized[key] = value;
    }
  });

  return sanitized;
};

export const isContextValue = (value: unknown): value is FlagForgeContextValue =>
  value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean";

export const toFallbackReason = (error: unknown): FlagForgeRequestError => {
  if (error instanceof FlagForgeRequestError) {
    return error;
  }

  if (error instanceof DOMException && error.name === "AbortError") {
    return new FlagForgeRequestError("TIMEOUT", "FlagForge request timed out");
  }

  if (error instanceof Error) {
    return new FlagForgeRequestError("NETWORK_ERROR", error.message);
  }

  return new FlagForgeRequestError("NETWORK_ERROR", "FlagForge request failed");
};

export const assertSingleEvaluationResponse = (value: unknown): FlagForgeSingleEvaluationResponse => {
  if (!isRecord(value) || typeof value.key !== "string" || typeof value.value !== "boolean" || typeof value.reason !== "string") {
    throw new FlagForgeRequestError("MALFORMED_RESPONSE", "FlagForge single evaluation response is malformed");
  }

  if (!isEnvironment(value.environment) || typeof value.evaluatedAt !== "string") {
    throw new FlagForgeRequestError("MALFORMED_RESPONSE", "FlagForge single evaluation metadata is malformed");
  }

  return value as unknown as FlagForgeSingleEvaluationResponse;
};

export const assertAllEvaluationsResponse = (value: unknown): FlagForgeAllEvaluationsResponse => {
  if (!isRecord(value) || !isBooleanMap(value.flags) || !isRecord(value.reasons)) {
    throw new FlagForgeRequestError("MALFORMED_RESPONSE", "FlagForge all-flags evaluation response is malformed");
  }

  if (!isEnvironment(value.environment) || typeof value.evaluatedAt !== "string") {
    throw new FlagForgeRequestError("MALFORMED_RESPONSE", "FlagForge all-flags evaluation metadata is malformed");
  }

  Object.entries(value.reasons).forEach(([_key, reason]) => {
    if (!isRecord(reason) || typeof reason.reason !== "string" || typeof reason.value !== "boolean") {
      throw new FlagForgeRequestError("MALFORMED_RESPONSE", "FlagForge all-flags reason metadata is malformed");
    }
  });

  return value as unknown as FlagForgeAllEvaluationsResponse;
};

export const createAbortSignal = (timeoutMs: number): { cleanup: () => void; signal: AbortSignal } => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  return {
    cleanup: () => clearTimeout(timeout),
    signal: controller.signal
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isEnvironment = (value: unknown): value is FlagForgeEnvironment =>
  isRecord(value) &&
  typeof value.id === "string" &&
  typeof value.key === "string" &&
  typeof value.name === "string" &&
  typeof value.projectId === "string";

const isBooleanMap = (value: unknown): value is Record<string, boolean> =>
  isRecord(value) && Object.values(value).every((entry) => typeof entry === "boolean");
