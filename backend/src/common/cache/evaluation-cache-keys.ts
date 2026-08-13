export const EVALUATION_CACHE_SCHEMA_VERSION = 1;
export const EVALUATION_CACHE_KEY_VERSION = "v1";

export const getEnvironmentEvaluationCacheKey = (environmentId: string): string =>
  `flagforge:evaluation:${EVALUATION_CACHE_KEY_VERSION}:environment:${environmentId}`;
