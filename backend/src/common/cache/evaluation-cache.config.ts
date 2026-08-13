export interface EvaluationCacheConfig {
  enabled: boolean;
  host: string;
  port: number;
  ttlSeconds: number;
  url: string | null;
}

const DEFAULT_REDIS_HOST = "localhost";
const DEFAULT_REDIS_PORT = 6379;
const DEFAULT_EVALUATION_CACHE_TTL_SECONDS = 300;

const parsePositiveInteger = (value: string | undefined, fallback: number): number => {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
};

export const getEvaluationCacheConfig = (): EvaluationCacheConfig => {
  const url = process.env.REDIS_URL?.trim() || null;
  const hasHostOrPort = Boolean(process.env.REDIS_HOST || process.env.REDIS_PORT);

  return {
    enabled: Boolean(url || hasHostOrPort),
    host: process.env.REDIS_HOST?.trim() || DEFAULT_REDIS_HOST,
    port: parsePositiveInteger(process.env.REDIS_PORT, DEFAULT_REDIS_PORT),
    ttlSeconds: parsePositiveInteger(process.env.EVALUATION_CACHE_TTL_SECONDS, DEFAULT_EVALUATION_CACHE_TTL_SECONDS),
    url
  };
};
