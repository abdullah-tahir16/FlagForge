import { NotFoundException } from "@nestjs/common";
import { AnalyticsService } from "../src/analytics/analytics.service";
import { EvaluationEventType } from "../src/analytics/evaluation-event-type.enum";
import { UserRole } from "../src/users/user-role.enum";

interface MockAnalyticsQueryBuilder {
  addOrderBy: jest.MockedFunction<() => MockAnalyticsQueryBuilder>;
  addSelect: jest.MockedFunction<() => MockAnalyticsQueryBuilder>;
  andWhere: jest.MockedFunction<() => MockAnalyticsQueryBuilder>;
  clone: jest.MockedFunction<() => MockAnalyticsQueryBuilder>;
  getRawMany: jest.MockedFunction<() => Promise<unknown[]>>;
  getRawOne: jest.MockedFunction<() => Promise<unknown>>;
  groupBy: jest.MockedFunction<() => MockAnalyticsQueryBuilder>;
  limit: jest.MockedFunction<() => MockAnalyticsQueryBuilder>;
  orderBy: jest.MockedFunction<() => MockAnalyticsQueryBuilder>;
  select: jest.MockedFunction<() => MockAnalyticsQueryBuilder>;
  where: jest.MockedFunction<() => MockAnalyticsQueryBuilder>;
}

const owner = {
  email: "owner@example.com",
  id: "user-1",
  organizationId: "org-1",
  role: UserRole.Owner
};

const createQueryBuilder = (rawOne?: unknown, rawMany: unknown[] = []) => {
  const builder = {} as MockAnalyticsQueryBuilder;
  builder.addOrderBy = jest.fn(() => builder);
  builder.addSelect = jest.fn(() => builder);
  builder.andWhere = jest.fn(() => builder);
  builder.clone = jest.fn(() => builder);
  builder.getRawMany = jest.fn(async () => rawMany);
  builder.getRawOne = jest.fn(async () => rawOne);
  builder.groupBy = jest.fn(() => builder);
  builder.limit = jest.fn(() => builder);
  builder.orderBy = jest.fn(() => builder);
  builder.select = jest.fn(() => builder);
  builder.where = jest.fn(() => builder);

  return builder;
};

const createService = () => {
  const inserted: unknown[] = [];
  const projectsService = {
    findProjectForUser: jest.fn(async () => ({ id: "project-1", organizationId: "org-1" }))
  };
  const repository = {
    create: jest.fn((value: unknown) => value),
    createQueryBuilder: jest.fn(() => createQueryBuilder({ falseCount: "0", total: "0", trueCount: "0" })),
    insert: jest.fn(async (events: unknown[]) => {
      inserted.push(...events);
    })
  };
  const service = new AnalyticsService(projectsService as never, repository as never);

  return { inserted, projectsService, repository, service };
};

describe("AnalyticsService", () => {
  it("persists evaluation events without raw SDK keys or context attributes", async () => {
    const { inserted, service } = createService();

    await service.recordEvaluations([
      {
        environmentId: "environment-1",
        evaluationType: EvaluationEventType.Single,
        flagKey: "new-checkout",
        organizationId: "org-1",
        projectId: "project-1",
        reason: "STATIC",
        sdkKeyId: "sdk-key-1",
        value: true
      }
    ]);

    expect(inserted).toEqual([
      expect.objectContaining({
        environmentId: "environment-1",
        evaluationType: EvaluationEventType.Single,
        flagKey: "new-checkout",
        organizationId: "org-1",
        projectId: "project-1",
        reason: "STATIC",
        sdkKeyId: "sdk-key-1",
        value: true
      })
    ]);
    expect(JSON.stringify(inserted)).not.toContain("ff_development_sk");
    expect(JSON.stringify(inserted)).not.toContain("user-123");
  });

  it("returns empty overview metrics when no events exist", async () => {
    const { service } = createService();

    await expect(service.getProjectOverview(owner, "project-1", {})).resolves.toMatchObject({
      falseCount: 0,
      filters: { environmentId: null, flagKey: null, range: "7d" },
      reasonBreakdown: [],
      timeBuckets: [],
      topFlags: [],
      totalEvaluations: 0,
      trueCount: 0
    });
  });

  it("applies filters and returns aggregate overview metrics", async () => {
    const totalsBuilder = createQueryBuilder({ falseCount: "2", total: "5", trueCount: "3" });
    const reasonBuilder = createQueryBuilder(undefined, [{ count: "5", reason: "STATIC" }]);
    const topFlagBuilder = createQueryBuilder(undefined, [{ falseCount: "2", flagKey: "new-checkout", total: "5", trueCount: "3" }]);
    const bucketBuilder = createQueryBuilder(undefined, [
      { bucketStart: new Date("2026-08-13T00:00:00.000Z"), falseCount: "2", total: "5", trueCount: "3" }
    ]);
    const baseBuilder = createQueryBuilder();
    baseBuilder.clone
      .mockReturnValueOnce(totalsBuilder)
      .mockReturnValueOnce(reasonBuilder)
      .mockReturnValueOnce(topFlagBuilder)
      .mockReturnValueOnce(bucketBuilder);
    const projectsService = {
      findProjectForUser: jest.fn(async () => ({ id: "project-1", organizationId: "org-1" }))
    };
    const repository = {
      create: jest.fn((value: unknown) => value),
      createQueryBuilder: jest.fn(() => baseBuilder),
      insert: jest.fn()
    };
    const service = new AnalyticsService(projectsService as never, repository as never);

    await expect(
      service.getProjectOverview(owner, "project-1", { environmentId: "environment-1", flagKey: "new-checkout", range: "24h" })
    ).resolves.toMatchObject({
      falseCount: 2,
      filters: { environmentId: "environment-1", flagKey: "new-checkout", range: "24h" },
      reasonBreakdown: [{ count: 5, reason: "STATIC" }],
      timeBuckets: [expect.objectContaining({ falseCount: 2, total: 5, trueCount: 3 })],
      topFlags: [{ falseCount: 2, flagKey: "new-checkout", total: 5, trueCount: 3 }],
      totalEvaluations: 5,
      trueCount: 3
    });
    expect(baseBuilder.andWhere).toHaveBeenCalledWith("event.environment_id = :environmentId", { environmentId: "environment-1" });
    expect(baseBuilder.andWhere).toHaveBeenCalledWith("event.flag_key = :flagKey", { flagKey: "new-checkout" });
    expect(bucketBuilder.orderBy).toHaveBeenCalledWith(`date_trunc('hour', event.occurred_at)`, "ASC");
  });

  it("uses project access control for overview requests", async () => {
    const { projectsService, service } = createService();
    projectsService.findProjectForUser.mockRejectedValueOnce(new NotFoundException("Project was not found"));

    await expect(service.getProjectOverview(owner, "other-project", {})).rejects.toBeInstanceOf(NotFoundException);
  });
});
