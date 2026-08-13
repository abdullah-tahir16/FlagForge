import { getEvaluationCacheConfig } from "../src/common/cache/evaluation-cache.config";
import { getEnvironmentEvaluationCacheKey } from "../src/common/cache/evaluation-cache-keys";
import { parseCachedEnvironmentEvaluationSnapshot } from "../src/common/cache/evaluation-cache-snapshot";
import { FeatureFlagType } from "../src/feature-flags/feature-flag-type.enum";

const originalEnv = process.env;

describe("evaluation cache contracts", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.REDIS_URL;
    delete process.env.REDIS_HOST;
    delete process.env.REDIS_PORT;
    delete process.env.EVALUATION_CACHE_TTL_SECONDS;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("builds versioned environment cache keys", () => {
    expect(getEnvironmentEvaluationCacheKey("environment-1")).toBe("flagforge:evaluation:v1:environment:environment-1");
  });

  it("parses Redis connection and cache TTL configuration", () => {
    expect(getEvaluationCacheConfig()).toMatchObject({ enabled: false, ttlSeconds: 300 });

    process.env.REDIS_URL = "redis://localhost:6379";
    process.env.EVALUATION_CACHE_TTL_SECONDS = "45";

    expect(getEvaluationCacheConfig()).toMatchObject({
      enabled: true,
      ttlSeconds: 45,
      url: "redis://localhost:6379"
    });

    process.env.EVALUATION_CACHE_TTL_SECONDS = "0";
    expect(getEvaluationCacheConfig()).toMatchObject({ ttlSeconds: 300 });
  });

  it("validates cache schema version and rejects invalid JSON", () => {
    const validSnapshot = {
      environment: {
        id: "environment-1",
        key: "development",
        name: "Development",
        projectId: "project-1"
      },
      flags: [
        {
          config: null,
          id: "flag-1",
          key: "new-checkout",
          name: "New Checkout",
          targetingRules: [],
          type: FeatureFlagType.Boolean
        }
      ],
      projectId: "project-1",
      schemaVersion: 1
    };

    expect(parseCachedEnvironmentEvaluationSnapshot(JSON.stringify(validSnapshot))).toMatchObject({
      environment: { id: "environment-1" },
      schemaVersion: 1
    });
    expect(parseCachedEnvironmentEvaluationSnapshot(JSON.stringify({ ...validSnapshot, schemaVersion: 999 }))).toBeNull();
    expect(parseCachedEnvironmentEvaluationSnapshot("{invalid-json")).toBeNull();
  });
});
