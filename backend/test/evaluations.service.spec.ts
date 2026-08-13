import { Environment } from "../src/environments/environment.entity";
import { EnvironmentFlagConfig } from "../src/feature-flags/environment-flag-config.entity";
import { FeatureFlag } from "../src/feature-flags/feature-flag.entity";
import { FeatureFlagType } from "../src/feature-flags/feature-flag-type.enum";
import { EvaluationsService } from "../src/evaluations/evaluations.service";
import { SdkEvaluationContext } from "../src/evaluations/sdk-evaluation-context";
import { TargetingRule } from "../src/targeting-rules/targeting-rule.entity";
import { TargetingRuleOperator } from "../src/targeting-rules/targeting-rule-operator.enum";

interface MockFeatureFlagQueryBuilder {
  addOrderBy: jest.MockedFunction<(sort: string, order: string) => MockFeatureFlagQueryBuilder>;
  getMany: jest.MockedFunction<() => Promise<FeatureFlag[]>>;
  leftJoinAndSelect: jest.MockedFunction<
    (relation: string, alias: string, condition?: string, params?: { environmentId: string }) => MockFeatureFlagQueryBuilder
  >;
  orderBy: jest.MockedFunction<(sort: string, order: string) => MockFeatureFlagQueryBuilder>;
  where: jest.MockedFunction<(query: string, params: { projectId: string }) => MockFeatureFlagQueryBuilder>;
}

const now = new Date("2026-08-13T00:00:00.000Z");

const environment = {
  id: "environment-1",
  key: "development",
  name: "Development",
  projectId: "project-1"
} as Environment;

const context: SdkEvaluationContext = {
  environment,
  sdkKey: { id: "sdk-key-1" } as never
};

const createFlag = (overrides: Partial<FeatureFlag> = {}): FeatureFlag =>
  ({
    createdAt: now,
    description: null,
    id: "flag-1",
    key: "new-checkout",
    name: "New Checkout",
    projectId: "project-1",
    type: FeatureFlagType.Boolean,
    updatedAt: now,
    ...overrides
  }) as FeatureFlag;

const createConfig = (overrides: Partial<EnvironmentFlagConfig> = {}): EnvironmentFlagConfig =>
  ({
    createdAt: now,
    enabled: true,
    environmentId: "environment-1",
    featureFlagId: "flag-1",
    id: "config-1",
    rolloutPercentage: 100,
    updatedAt: now,
    value: true,
    ...overrides
  }) as EnvironmentFlagConfig;

const createRule = (overrides: Partial<TargetingRule> = {}): TargetingRule =>
  ({
    attribute: "country",
    comparisonValue: "IT",
    createdAt: now,
    environmentFlagConfigId: "config-1",
    id: "rule-1",
    operator: TargetingRuleOperator.Equals,
    resultValue: true,
    sortOrder: 1,
    updatedAt: now,
    ...overrides
  }) as TargetingRule;

const createService = () => {
  const configs = new Map<string, EnvironmentFlagConfig>();
  const flags = new Map<string, FeatureFlag>();
  const featureFlagsRepository = {
    createQueryBuilder: jest.fn(() => {
      const state = { environmentId: "", projectId: "" };
      const builder = {} as MockFeatureFlagQueryBuilder;

      builder.addOrderBy = jest.fn((_sort, _order) => builder);
      builder.getMany = jest.fn(async () =>
        Array.from(flags.values())
          .filter((flag) => flag.projectId === state.projectId)
          .sort((first, second) => first.key.localeCompare(second.key))
          .map(
            (flag) =>
              ({
                ...flag,
                environmentConfigs: Array.from(configs.values()).filter(
                  (config) => config.featureFlagId === flag.id && config.environmentId === state.environmentId
                )
              }) as FeatureFlag
          )
      );
      builder.leftJoinAndSelect = jest.fn((_relation, _alias, _condition, params) => {
        state.environmentId = params?.environmentId ?? state.environmentId;
        return builder;
      });
      builder.orderBy = jest.fn((_sort, _order) => builder);
      builder.where = jest.fn((_query, params) => {
        state.projectId = params.projectId;
        return builder;
      });

      return builder;
    }),
    findOne: jest.fn(async ({ where }: { where: Partial<FeatureFlag> }) =>
      Array.from(flags.values()).find((flag) => flag.key === where.key && flag.projectId === where.projectId)
    )
  };
  const configsRepository = {
    findOne: jest.fn(async ({ where }: { where: Partial<EnvironmentFlagConfig> }) =>
      Array.from(configs.values()).find(
        (config) => config.environmentId === where.environmentId && config.featureFlagId === where.featureFlagId
      )
    )
  };
  const service = new EvaluationsService(configsRepository as never, featureFlagsRepository as never);

  return { configs, configsRepository, flags, service };
};

describe("EvaluationsService", () => {
  it("returns the configured value for an enabled boolean flag", async () => {
    const { configs, flags, service } = createService();
    flags.set("flag-1", createFlag());
    configs.set("config-1", createConfig({ value: true }));

    await expect(service.evaluateOne(context, "new-checkout")).resolves.toMatchObject({
      key: "new-checkout",
      reason: "STATIC",
      value: true
    });
  });

  it("returns false for disabled, missing flag, and missing config cases", async () => {
    const { configs, flags, service } = createService();
    flags.set("flag-1", createFlag());
    flags.set("flag-2", createFlag({ id: "flag-2", key: "beta-navigation" }));
    configs.set("config-1", createConfig({ enabled: false, value: true }));

    await expect(service.evaluateOne(context, "new-checkout")).resolves.toMatchObject({
      reason: "DISABLED",
      value: false
    });
    await expect(service.evaluateOne(context, "missing-flag")).resolves.toMatchObject({
      reason: "FLAG_NOT_FOUND",
      value: false
    });
    await expect(service.evaluateOne(context, "beta-navigation")).resolves.toMatchObject({
      reason: "CONFIG_NOT_FOUND",
      value: false
    });
  });

  it("evaluates percentage rollouts deterministically", async () => {
    const { configs, flags, service } = createService();
    flags.set("flag-1", createFlag());
    configs.set("config-1", createConfig({ rolloutPercentage: 25, value: true }));

    await expect(service.evaluateOne(context, "new-checkout", { userId: "c" })).resolves.toMatchObject({
      reason: "PERCENTAGE_ROLLOUT",
      value: true
    });
    await expect(service.evaluateOne(context, "new-checkout", { userId: "alice" })).resolves.toMatchObject({
      reason: "PERCENTAGE_ROLLOUT",
      value: false
    });
    await expect(service.evaluateOne(context, "new-checkout", { userId: "c" })).resolves.toMatchObject({
      reason: "PERCENTAGE_ROLLOUT",
      value: true
    });
  });

  it("handles rollout edges and missing rollout context safely", async () => {
    const { configs, flags, service } = createService();
    flags.set("flag-1", createFlag());

    configs.set("config-1", createConfig({ rolloutPercentage: 0, value: true }));
    await expect(service.evaluateOne(context, "new-checkout", { userId: "c" })).resolves.toMatchObject({
      reason: "PERCENTAGE_ROLLOUT",
      value: false
    });

    configs.set("config-1", createConfig({ rolloutPercentage: 25, value: true }));
    await expect(service.evaluateOne(context, "new-checkout")).resolves.toMatchObject({
      reason: "ROLLOUT_CONTEXT_MISSING",
      value: false
    });

    configs.set("config-1", createConfig({ enabled: false, rolloutPercentage: 25, value: true }));
    await expect(service.evaluateOne(context, "new-checkout", { userId: "c" })).resolves.toMatchObject({
      reason: "DISABLED",
      value: false
    });
  });

  it("evaluates matching targeting rules before percentage rollout", async () => {
    const { configs, flags, service } = createService();
    flags.set("flag-1", createFlag());
    configs.set(
      "config-1",
      createConfig({
        rolloutPercentage: 0,
        targetingRules: [
          createRule({ attribute: "country", comparisonValue: "FR", resultValue: false, sortOrder: 1 }),
          createRule({ attribute: "plan", comparisonValue: "PREMIUM", id: "rule-2", resultValue: true, sortOrder: 2 })
        ]
      })
    );

    await expect(service.evaluateOne(context, "new-checkout", { country: "IT", plan: "PREMIUM" })).resolves.toMatchObject({
      reason: "TARGETING_RULE_MATCH",
      targetingRule: { attribute: "plan", id: "rule-2", operator: TargetingRuleOperator.Equals },
      value: true
    });
  });

  it("uses first matching targeting rule and skips targeting for disabled flags", async () => {
    const { configs, flags, service } = createService();
    flags.set("flag-1", createFlag());
    configs.set(
      "config-1",
      createConfig({
        targetingRules: [
          createRule({ attribute: "country", comparisonValue: "IT", resultValue: false, sortOrder: 1 }),
          createRule({ attribute: "plan", comparisonValue: "PREMIUM", id: "rule-2", resultValue: true, sortOrder: 2 })
        ]
      })
    );

    await expect(service.evaluateOne(context, "new-checkout", { country: "IT", plan: "PREMIUM" })).resolves.toMatchObject({
      reason: "TARGETING_RULE_MATCH",
      targetingRule: { id: "rule-1" },
      value: false
    });

    configs.set("config-1", createConfig({ enabled: false, targetingRules: [createRule()] }));
    await expect(service.evaluateOne(context, "new-checkout", { country: "IT" })).resolves.toMatchObject({
      reason: "DISABLED",
      targetingRule: undefined,
      value: false
    });
  });

  it("evaluates all project flags for the SDK key environment", async () => {
    const { configs, flags, service } = createService();
    flags.set("flag-1", createFlag({ key: "new-checkout" }));
    flags.set("flag-2", createFlag({ id: "flag-2", key: "beta-navigation" }));
    configs.set("config-1", createConfig({ featureFlagId: "flag-1", value: true }));
    configs.set("config-2", createConfig({ enabled: false, featureFlagId: "flag-2", id: "config-2", value: true }));

    await expect(service.evaluateAll(context)).resolves.toMatchObject({
      flags: {
        "beta-navigation": false,
        "new-checkout": true
      },
      reasons: {
        "beta-navigation": { reason: "DISABLED", value: false },
        "new-checkout": { reason: "STATIC", value: true }
      }
    });
  });

  it("applies rollout behavior independently when evaluating all flags", async () => {
    const { configs, flags, service } = createService();
    flags.set("flag-1", createFlag({ key: "new-checkout" }));
    flags.set("flag-2", createFlag({ id: "flag-2", key: "beta-navigation" }));
    configs.set("config-1", createConfig({ featureFlagId: "flag-1", rolloutPercentage: 25, value: true }));
    configs.set(
      "config-2",
      createConfig({ featureFlagId: "flag-2", id: "config-2", rolloutPercentage: 25, value: true })
    );

    await expect(service.evaluateAll(context, { userId: "c" })).resolves.toMatchObject({
      flags: {
        "beta-navigation": false,
        "new-checkout": true
      },
      reasons: {
        "beta-navigation": { reason: "PERCENTAGE_ROLLOUT", value: false },
        "new-checkout": { reason: "PERCENTAGE_ROLLOUT", value: true }
      }
    });
  });

  it("applies targeting behavior independently when evaluating all flags", async () => {
    const { configs, flags, service } = createService();
    flags.set("flag-1", createFlag({ key: "new-checkout" }));
    flags.set("flag-2", createFlag({ id: "flag-2", key: "beta-navigation" }));
    configs.set(
      "config-1",
      createConfig({ featureFlagId: "flag-1", targetingRules: [createRule({ attribute: "country", comparisonValue: "IT" })] })
    );
    configs.set(
      "config-2",
      createConfig({
        featureFlagId: "flag-2",
        id: "config-2",
        targetingRules: [createRule({ attribute: "plan", comparisonValue: "PREMIUM", environmentFlagConfigId: "config-2", id: "rule-2" })]
      })
    );

    await expect(service.evaluateAll(context, { country: "IT", plan: "PREMIUM" })).resolves.toMatchObject({
      flags: {
        "beta-navigation": true,
        "new-checkout": true
      },
      reasons: {
        "beta-navigation": { reason: "TARGETING_RULE_MATCH", targetingRule: { id: "rule-2" }, value: true },
        "new-checkout": { reason: "TARGETING_RULE_MATCH", targetingRule: { id: "rule-1" }, value: true }
      }
    });
  });

  it("returns an empty flag map when the project has no flags", async () => {
    const { service } = createService();

    await expect(service.evaluateAll(context)).resolves.toMatchObject({
      flags: {},
      reasons: {}
    });
  });
});
