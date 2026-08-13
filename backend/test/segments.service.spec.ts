import { BadRequestException, ConflictException } from "@nestjs/common";
import { AuditAction } from "../src/audit/audit-action.enum";
import { AuditResourceType } from "../src/audit/audit-resource-type.enum";
import { AuthenticatedUser } from "../src/auth/authenticated-user";
import { RealtimeEventAction } from "../src/realtime/realtime-event-action.enum";
import { RealtimeResourceType } from "../src/realtime/realtime-resource-type.enum";
import { SegmentCondition } from "../src/segments/segment-condition.entity";
import { SegmentMatchMode } from "../src/segments/segment-match-mode.enum";
import { Segment } from "../src/segments/segment.entity";
import { SegmentsService } from "../src/segments/segments.service";
import { TargetingRule } from "../src/targeting-rules/targeting-rule.entity";
import { TargetingRuleOperator } from "../src/targeting-rules/targeting-rule-operator.enum";
import { UserRole } from "../src/users/user-role.enum";

const now = new Date("2026-08-13T00:00:00.000Z");
const owner: AuthenticatedUser = {
  email: "owner@example.com",
  id: "user-1",
  organizationId: "org-1",
  role: UserRole.Owner
};

interface MockSegmentQueryBuilder {
  addOrderBy: jest.MockedFunction<() => MockSegmentQueryBuilder>;
  andWhere: jest.MockedFunction<() => MockSegmentQueryBuilder>;
  getMany: jest.MockedFunction<() => Promise<Segment[]>>;
  orderBy: jest.MockedFunction<() => MockSegmentQueryBuilder>;
  take: jest.MockedFunction<() => MockSegmentQueryBuilder>;
  where: jest.MockedFunction<() => MockSegmentQueryBuilder>;
}

interface MockConditionQueryBuilder {
  getRawOne: jest.MockedFunction<() => Promise<{ max: number }>>;
  select: jest.MockedFunction<() => MockConditionQueryBuilder>;
  where: jest.MockedFunction<() => MockConditionQueryBuilder>;
}

const createSegment = (overrides: Partial<Segment> = {}): Segment =>
  ({
    conditions: [],
    createdAt: now,
    description: null,
    id: "segment-1",
    key: "premium-users",
    matchMode: SegmentMatchMode.MatchAll,
    name: "Premium Users",
    projectId: "project-1",
    updatedAt: now,
    ...overrides
  }) as Segment;

const createCondition = (overrides: Partial<SegmentCondition> = {}): SegmentCondition =>
  ({
    attribute: "country",
    comparisonValue: "IT",
    createdAt: now,
    id: "condition-1",
    operator: TargetingRuleOperator.Equals,
    segmentId: "segment-1",
    sortOrder: 1,
    updatedAt: now,
    ...overrides
  }) as SegmentCondition;

const createService = () => {
  const segments = new Map<string, Segment>();
  const conditions = new Map<string, SegmentCondition>();
  const targetingRules = new Map<string, TargetingRule>();
  const auditService = { record: jest.fn(async () => undefined) };
  const evaluationCacheService = { deleteEnvironmentSnapshots: jest.fn(async () => undefined) };
  const realtimePublisher = { publishConfigurationChanged: jest.fn() };
  const projectsService = { findProjectForUser: jest.fn(async () => ({ id: "project-1" })) };

  const attachConditions = (segment: Segment): Segment => ({
    ...segment,
    conditions: Array.from(conditions.values())
      .filter((condition) => condition.segmentId === segment.id)
      .sort((first, second) => first.sortOrder - second.sortOrder)
  }) as Segment;

  const segmentQueryBuilder = {} as MockSegmentQueryBuilder;
  segmentQueryBuilder.addOrderBy = jest.fn(() => segmentQueryBuilder);
  segmentQueryBuilder.andWhere = jest.fn(() => segmentQueryBuilder);
  segmentQueryBuilder.getMany = jest.fn(async () =>
    Array.from(segments.values()).sort((first, second) => second.createdAt.getTime() - first.createdAt.getTime())
  );
  segmentQueryBuilder.orderBy = jest.fn(() => segmentQueryBuilder);
  segmentQueryBuilder.take = jest.fn(() => segmentQueryBuilder);
  segmentQueryBuilder.where = jest.fn(() => segmentQueryBuilder);
  const conditionQueryBuilder = {} as MockConditionQueryBuilder;
  conditionQueryBuilder.getRawOne = jest.fn(async () => ({
    max: Math.max(0, ...Array.from(conditions.values()).map((condition) => condition.sortOrder))
  }));
  conditionQueryBuilder.select = jest.fn(() => conditionQueryBuilder);
  conditionQueryBuilder.where = jest.fn(() => conditionQueryBuilder);

  const segmentsRepository = {
    create: jest.fn((value: Partial<Segment>) => value as Segment),
    createQueryBuilder: jest.fn(() => segmentQueryBuilder),
    find: jest.fn(async ({ where }: { where: Partial<Segment> }) =>
      Array.from(segments.values()).filter((segment) => segment.projectId === where.projectId)
    ),
    findOne: jest.fn(async ({ where }: { where: Partial<Segment> }) => {
      const segment = Array.from(segments.values()).find(
        (value) =>
          (!where.id || value.id === where.id) &&
          (!where.key || value.key === where.key) &&
          (!where.projectId || value.projectId === where.projectId)
      );

      return segment ? attachConditions(segment) : null;
    }),
    remove: jest.fn(async (segment: Segment) => {
      segments.delete(segment.id);
      Array.from(conditions.values())
        .filter((condition) => condition.segmentId === segment.id)
        .forEach((condition) => conditions.delete(condition.id));
    }),
    save: jest.fn(async (segment: Segment) => {
      const savedSegment = {
        ...segment,
        conditions: segment.conditions ?? [],
        createdAt: segment.createdAt ?? now,
        id: segment.id ?? `segment-${segments.size + 1}`,
        updatedAt: now
      } as Segment;
      segments.set(savedSegment.id, savedSegment);
      return savedSegment;
    })
  };

  const conditionsRepository = {
    create: jest.fn((value: Partial<SegmentCondition>) => value as SegmentCondition),
    createQueryBuilder: jest.fn(() => conditionQueryBuilder),
    find: jest.fn(async ({ where }: { where: Partial<SegmentCondition> }) =>
      Array.from(conditions.values())
        .filter((condition) => condition.segmentId === where.segmentId)
        .sort((first, second) => first.sortOrder - second.sortOrder)
    ),
    remove: jest.fn(async (condition: SegmentCondition) => {
      conditions.delete(condition.id);
      Object.assign(condition, { id: undefined });
    }),
    save: jest.fn(async (condition: SegmentCondition) => {
      const savedCondition = {
        ...condition,
        createdAt: condition.createdAt ?? now,
        id: condition.id ?? `condition-${conditions.size + 1}`,
        updatedAt: now
      } as SegmentCondition;
      conditions.set(savedCondition.id, savedCondition);
      return savedCondition;
    }),
    update: jest.fn(async (where: Partial<SegmentCondition>, value: Partial<SegmentCondition>) => {
      const condition = conditions.get(where.id as string);

      if (condition) {
        conditions.set(condition.id, { ...condition, ...value });
      }
    })
  };
  const targetingRulesRepository = {
    createQueryBuilder: jest.fn(() => {
      const state = { segmentId: "" };
      const builder = {} as {
        getRawMany: jest.MockedFunction<() => Promise<{ environmentId: string }[]>>;
        innerJoin: jest.MockedFunction<() => typeof builder>;
        select: jest.MockedFunction<() => typeof builder>;
        where: jest.MockedFunction<(_query: string, params: { segmentId: string }) => typeof builder>;
      };
      builder.getRawMany = jest.fn(async () =>
        Array.from(targetingRules.values())
          .filter((rule) => rule.segmentId === state.segmentId && rule.environmentFlagConfig?.environmentId)
          .map((rule) => ({ environmentId: rule.environmentFlagConfig.environmentId }))
      );
      builder.innerJoin = jest.fn(() => builder);
      builder.select = jest.fn(() => builder);
      builder.where = jest.fn((_query: string, params: { segmentId: string }) => {
        state.segmentId = params.segmentId;
        return builder;
      });

      return builder;
    }),
    findOne: jest.fn(async ({ where }: { where: Partial<TargetingRule> }) =>
      Array.from(targetingRules.values()).find((rule) => rule.segmentId === where.segmentId) ?? null
    )
  };
  const dataSource = {
    transaction: jest.fn((callback: (manager: { getRepository: (entity: unknown) => unknown }) => Promise<unknown>) =>
      callback({
        getRepository: (entity: unknown) => (entity === SegmentCondition ? conditionsRepository : segmentsRepository)
      })
    )
  };
  const service = new SegmentsService(
    auditService as never,
    evaluationCacheService as never,
    realtimePublisher as never,
    dataSource as never,
    projectsService as never,
    segmentsRepository as never,
    conditionsRepository as never,
    targetingRulesRepository as never
  );

  return { auditService, conditions, evaluationCacheService, realtimePublisher, segments, service, targetingRules };
};

describe("SegmentsService", () => {
  it("lists and creates project segments with cursor pagination and audit", async () => {
    const { auditService, segments, service } = createService();
    segments.set("segment-1", createSegment());

    await expect(service.findAll(owner, "project-1", { limit: 25 })).resolves.toMatchObject({
      entries: [expect.objectContaining({ id: "segment-1", key: "premium-users" })],
      pagination: { hasNextPage: false, limit: 25, nextCursor: null }
    });

    await expect(
      service.create(owner, "project-1", {
        description: "  Internal staff  ",
        matchMode: SegmentMatchMode.MatchAny,
        name: "Internal Staff"
      })
    ).resolves.toMatchObject({
      description: "Internal staff",
      key: "internal-staff",
      matchMode: SegmentMatchMode.MatchAny
    });
    expect(auditService.record).toHaveBeenCalledWith(
      owner,
      expect.objectContaining({
        action: AuditAction.SegmentCreated,
        resourceType: AuditResourceType.Segment
      }),
      undefined
    );
  });

  it("rejects duplicate segments and referenced segment deletion", async () => {
    const { segments, service, targetingRules } = createService();
    segments.set("segment-1", createSegment());
    targetingRules.set("rule-1", { id: "rule-1", segmentId: "segment-1" } as TargetingRule);

    await expect(service.create(owner, "project-1", { name: "Premium Users" })).rejects.toBeInstanceOf(ConflictException);
    await expect(service.remove(owner, "project-1", "segment-1")).rejects.toBeInstanceOf(ConflictException);
  });

  it("updates segment metadata without changing the key", async () => {
    const { evaluationCacheService, realtimePublisher, segments, service } = createService();
    segments.set("segment-1", createSegment());

    await expect(
      service.update(owner, "project-1", "segment-1", {
        description: null,
        matchMode: SegmentMatchMode.MatchAny,
        name: "Renamed Segment"
      })
    ).resolves.toMatchObject({
      description: null,
      key: "premium-users",
      matchMode: SegmentMatchMode.MatchAny,
      name: "Renamed Segment"
    });
    expect(evaluationCacheService.deleteEnvironmentSnapshots).not.toHaveBeenCalled();
    expect(realtimePublisher.publishConfigurationChanged).toHaveBeenCalledWith({
      action: RealtimeEventAction.Updated,
      environmentIds: [],
      organizationId: "org-1",
      projectId: "project-1",
      resourceId: "segment-1",
      resourceType: RealtimeResourceType.Segment
    });
  });

  it("creates, updates, deletes, and reorders segment conditions with validation", async () => {
    const { auditService, conditions, evaluationCacheService, segments, service, targetingRules } = createService();
    segments.set("segment-1", createSegment());
    conditions.set("condition-1", createCondition({ id: "condition-1", sortOrder: 1 }));
    conditions.set("condition-2", createCondition({ attribute: "plan", id: "condition-2", sortOrder: 2 }));
    targetingRules.set("rule-1", {
      environmentFlagConfig: { environmentId: "environment-1" },
      id: "rule-1",
      segmentId: "segment-1"
    } as TargetingRule);

    await expect(
      service.createCondition(owner, "project-1", "segment-1", {
        attribute: "age",
        comparisonValue: "18",
        operator: TargetingRuleOperator.GreaterThan
      })
    ).rejects.toBeInstanceOf(BadRequestException);

    await expect(
      service.updateCondition(owner, "project-1", "segment-1", "condition-1", {
        comparisonValue: ["IT", "FR"],
        operator: TargetingRuleOperator.In
      })
    ).resolves.toMatchObject({
      conditions: expect.arrayContaining([expect.objectContaining({ comparisonValue: ["IT", "FR"], id: "condition-1" })])
    });
    expect(evaluationCacheService.deleteEnvironmentSnapshots).toHaveBeenCalledWith(["environment-1"]);

    await expect(
      service.reorderConditions(owner, "project-1", "segment-1", { conditionIds: ["condition-2"] })
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.reorderConditions(owner, "project-1", "segment-1", { conditionIds: ["condition-2", "condition-1"] })
    ).resolves.toMatchObject({
      conditions: [expect.objectContaining({ id: "condition-2", sortOrder: 1 }), expect.objectContaining({ id: "condition-1", sortOrder: 2 })]
    });
    expect(evaluationCacheService.deleteEnvironmentSnapshots).toHaveBeenCalledWith(["environment-1"]);

    await expect(service.removeCondition(owner, "project-1", "segment-1", "condition-2")).resolves.toMatchObject({
      conditions: [expect.objectContaining({ id: "condition-1", sortOrder: 1 })]
    });
    expect(conditions.has("condition-2")).toBe(false);
    expect(auditService.record).toHaveBeenCalledWith(
      owner,
      expect.objectContaining({
        action: AuditAction.SegmentConditionDeleted,
        resourceId: "condition-2"
      }),
      undefined
    );
    expect(evaluationCacheService.deleteEnvironmentSnapshots).toHaveBeenLastCalledWith(["environment-1"]);
  });
});
