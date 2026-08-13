import { BadRequestException, NotFoundException } from "@nestjs/common";
import { AuditAction } from "../src/audit/audit-action.enum";
import { AuditResourceType } from "../src/audit/audit-resource-type.enum";
import { AuditService } from "../src/audit/audit.service";
import { Environment } from "../src/environments/environment.entity";
import { EnvironmentFlagConfig } from "../src/feature-flags/environment-flag-config.entity";
import { FeatureFlag } from "../src/feature-flags/feature-flag.entity";
import { FeatureFlagType } from "../src/feature-flags/feature-flag-type.enum";
import { ProjectsService } from "../src/projects/projects.service";
import { RealtimeEventAction } from "../src/realtime/realtime-event-action.enum";
import { RealtimeResourceType } from "../src/realtime/realtime-resource-type.enum";
import { TargetingRule } from "../src/targeting-rules/targeting-rule.entity";
import { TargetingRuleOperator } from "../src/targeting-rules/targeting-rule-operator.enum";
import { TargetingRuleSource } from "../src/targeting-rules/targeting-rule-source.enum";
import { Segment } from "../src/segments/segment.entity";
import { TargetingRulesService } from "../src/targeting-rules/targeting-rules.service";
import { UserRole } from "../src/users/user-role.enum";

const now = new Date("2026-08-13T00:00:00.000Z");
const owner = {
  email: "owner@example.com",
  id: "user-1",
  organizationId: "org-1",
  role: UserRole.Owner
};

const environment = {
  createdAt: now,
  id: "environment-1",
  key: "development",
  name: "Development",
  projectId: "project-1",
  sortOrder: 10,
  updatedAt: now
} as Environment;

const featureFlag = {
  createdAt: now,
  description: null,
  id: "flag-1",
  key: "new-checkout",
  name: "New Checkout",
  projectId: "project-1",
  type: FeatureFlagType.Boolean,
  updatedAt: now
} as FeatureFlag;

const config = {
  createdAt: now,
  enabled: true,
  environmentId: "environment-1",
  featureFlagId: "flag-1",
  id: "config-1",
  rolloutPercentage: 100,
  updatedAt: now,
  value: true
} as EnvironmentFlagConfig;

interface MockRuleQueryBuilder {
  getRawOne: jest.MockedFunction<() => Promise<{ max: number }>>;
  select: jest.MockedFunction<(selection: string, alias: string) => MockRuleQueryBuilder>;
  where: jest.MockedFunction<(query: string, params: { environmentFlagConfigId: string }) => MockRuleQueryBuilder>;
}

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
    source: TargetingRuleSource.Attribute,
    updatedAt: now,
    ...overrides
  }) as TargetingRule;

const createService = () => {
  const rules = new Map<string, TargetingRule>();
  const segments = new Map<string, Segment>();
  const auditService = { record: jest.fn(async () => undefined) };
  const evaluationCacheService = { deleteEnvironmentSnapshot: jest.fn(async () => undefined) };
  const realtimePublisher = { publishConfigurationChanged: jest.fn() };
  const projectsService = { findProjectForUser: jest.fn(async () => ({ id: "project-1" })) };
  const environmentsRepository = {
    findOne: jest.fn(async ({ where }: { where: Partial<Environment> }) =>
      where.id === environment.id && where.projectId === environment.projectId ? environment : null
    )
  };
  const configsRepository = {
    findOne: jest.fn(async ({ where }: { where: Partial<EnvironmentFlagConfig> }) =>
      where.environmentId === config.environmentId && where.featureFlagId === config.featureFlagId ? config : null
    )
  };
  const featureFlagsRepository = {
    findOne: jest.fn(async ({ where }: { where: Partial<FeatureFlag> }) =>
      where.id === featureFlag.id && where.projectId === featureFlag.projectId ? featureFlag : null
    )
  };
  const rulesRepository = {
    create: jest.fn((value: Partial<TargetingRule>) => value as TargetingRule),
    createQueryBuilder: jest.fn(() => {
      const builder = {} as MockRuleQueryBuilder;

      builder.getRawOne = jest.fn(async () => ({
        max: Math.max(0, ...Array.from(rules.values()).map((rule) => rule.sortOrder))
      }));
      builder.select = jest.fn((_selection, _alias) => builder);
      builder.where = jest.fn((_query, _params) => builder);

      return builder;
    }),
    find: jest.fn(async ({ where }: { where: Partial<TargetingRule> }) =>
      Array.from(rules.values())
        .filter((rule) => rule.environmentFlagConfigId === where.environmentFlagConfigId)
        .sort((first, second) => first.sortOrder - second.sortOrder)
    ),
    findOne: jest.fn(async ({ where }: { where: Partial<TargetingRule> }) =>
      Array.from(rules.values()).find(
        (rule) => rule.id === where.id && rule.environmentFlagConfigId === where.environmentFlagConfigId
      ) ?? null
    ),
    remove: jest.fn(async (rule: TargetingRule) => {
      rules.delete(rule.id);
      Object.assign(rule, { id: undefined });
    }),
    save: jest.fn(async (rule: TargetingRule) => {
      const savedRule = {
        ...rule,
        createdAt: rule.createdAt ?? now,
        id: rule.id ?? `rule-${rules.size + 1}`,
        updatedAt: rule.updatedAt ?? now
      } as TargetingRule;
      rules.set(savedRule.id, savedRule);
      return savedRule;
    }),
    update: jest.fn(async (where: Partial<TargetingRule>, value: Partial<TargetingRule>) => {
      const rule = rules.get(where.id as string);

      if (rule) {
        rules.set(rule.id, { ...rule, ...value });
      }
    })
  };
  const segmentsRepository = {
    findOne: jest.fn(async ({ where }: { where: Partial<Segment> }) =>
      Array.from(segments.values()).find((segment) => segment.id === where.id && segment.projectId === where.projectId) ?? null
    )
  };
  const dataSource = {
    transaction: jest.fn((callback: (manager: { getRepository: () => typeof rulesRepository }) => Promise<unknown>) =>
      callback({ getRepository: () => rulesRepository })
    )
  };
  const service = new TargetingRulesService(
    auditService as unknown as AuditService,
    evaluationCacheService as never,
    realtimePublisher as never,
    dataSource as never,
    projectsService as unknown as ProjectsService,
    environmentsRepository as never,
    configsRepository as never,
    featureFlagsRepository as never,
    segmentsRepository as never,
    rulesRepository as never
  );

  return { auditService, dataSource, evaluationCacheService, projectsService, realtimePublisher, rules, rulesRepository, segments, service };
};

describe("TargetingRulesService", () => {
  it("lists and creates ordered rules with audit events", async () => {
    const { auditService, evaluationCacheService, realtimePublisher, rules, service } = createService();
    rules.set("rule-1", createRule());

    await expect(service.findAll(owner, "project-1", "flag-1", "environment-1")).resolves.toEqual([
      expect.objectContaining({ id: "rule-1", sortOrder: 1 })
    ]);

    const created = await service.create(owner, "project-1", "flag-1", "environment-1", {
      attribute: "email",
      comparisonValue: "@company.com",
      operator: TargetingRuleOperator.EndsWith,
      resultValue: true
    });

    expect(created).toMatchObject({ attribute: "email", id: "rule-2", sortOrder: 2 });
    expect(auditService.record).toHaveBeenCalledWith(
      owner,
      expect.objectContaining({
        action: AuditAction.TargetingRuleCreated,
        environmentId: "environment-1",
        projectId: "project-1",
        resourceType: AuditResourceType.TargetingRule
      }),
      undefined
    );
    expect(evaluationCacheService.deleteEnvironmentSnapshot).toHaveBeenCalledWith("environment-1");
    expect(realtimePublisher.publishConfigurationChanged).toHaveBeenCalledWith({
      action: RealtimeEventAction.Created,
      environmentIds: ["environment-1"],
      organizationId: "org-1",
      projectId: "project-1",
      resourceId: created.id,
      resourceType: RealtimeResourceType.TargetingRule
    });
  });

  it("updates, deletes, and reorders rules with validation", async () => {
    const { auditService, evaluationCacheService, rules, service } = createService();
    rules.set("rule-1", createRule({ id: "rule-1", sortOrder: 1 }));
    rules.set("rule-2", createRule({ attribute: "plan", id: "rule-2", sortOrder: 2 }));

    await expect(
      service.update(owner, "project-1", "flag-1", "environment-1", "rule-1", {
        comparisonValue: "PREMIUM",
        operator: TargetingRuleOperator.In
      })
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.update(owner, "project-1", "flag-1", "environment-1", "rule-1", {
        comparisonValue: ["FREE", "PREMIUM"],
        operator: TargetingRuleOperator.In
      })
    ).resolves.toMatchObject({ comparisonValue: ["FREE", "PREMIUM"], operator: TargetingRuleOperator.In });
    expect(evaluationCacheService.deleteEnvironmentSnapshot).toHaveBeenCalledWith("environment-1");

    await expect(
      service.reorder(owner, "project-1", "flag-1", "environment-1", { ruleIds: ["rule-2"] })
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.reorder(owner, "project-1", "flag-1", "environment-1", { ruleIds: ["rule-2", "rule-1"] })
    ).resolves.toEqual([expect.objectContaining({ id: "rule-2", sortOrder: 1 }), expect.objectContaining({ id: "rule-1", sortOrder: 2 })]);
    expect(evaluationCacheService.deleteEnvironmentSnapshot).toHaveBeenCalledWith("environment-1");

    await service.remove(owner, "project-1", "flag-1", "environment-1", "rule-2");
    expect(rules.has("rule-2")).toBe(false);
    expect(rules.get("rule-1")).toMatchObject({ sortOrder: 1 });
    expect(auditService.record).toHaveBeenCalledWith(
      owner,
      expect.objectContaining({
        action: AuditAction.TargetingRuleDeleted,
        resourceId: "rule-2"
      }),
      undefined
    );
    expect(evaluationCacheService.deleteEnvironmentSnapshot).toHaveBeenLastCalledWith("environment-1");
  });

  it("rejects missing environment, flag, config, and rule access", async () => {
    const { service } = createService();

    await expect(service.update(owner, "project-1", "flag-1", "environment-1", "missing", {})).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it("creates and updates segment-source rules with safe segment metadata", async () => {
    const { segments, service } = createService();
    segments.set("segment-1", {
      createdAt: now,
      description: null,
      id: "segment-1",
      key: "premium-users",
      name: "Premium Users",
      projectId: "project-1",
      updatedAt: now
    } as Segment);

    const created = await service.create(owner, "project-1", "flag-1", "environment-1", {
      resultValue: true,
      segmentId: "segment-1",
      source: TargetingRuleSource.Segment
    });

    expect(created).toMatchObject({
      attribute: null,
      comparisonValue: null,
      segment: { id: "segment-1", key: "premium-users", name: "Premium Users" },
      segmentId: "segment-1",
      source: TargetingRuleSource.Segment
    });
  });
});
