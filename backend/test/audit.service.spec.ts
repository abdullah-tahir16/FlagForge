import { AuditAction } from "../src/audit/audit-action.enum";
import { AuditLog } from "../src/audit/audit-log.entity";
import { AuditResourceType } from "../src/audit/audit-resource-type.enum";
import { AuditService } from "../src/audit/audit.service";
import { UserRole } from "../src/users/user-role.enum";

const now = new Date("2026-08-13T00:00:00.000Z");
const user = {
  email: "user@example.com",
  id: "user-1",
  organizationId: "org-1",
  role: UserRole.Owner
};

const createAuditLog = (overrides: Partial<AuditLog> = {}): AuditLog =>
  ({
    action: AuditAction.ProjectCreated,
    actorEmail: user.email,
    actorUserId: user.id,
    createdAt: now,
    environmentId: null,
    id: "audit-1",
    ipAddress: null,
    newValue: null,
    oldValue: null,
    organizationId: "org-1",
    projectId: "project-1",
    resourceId: "project-1",
    resourceName: "Checkout",
    resourceType: AuditResourceType.Project,
    ...overrides
  }) as AuditLog;

interface MockAuditQueryBuilder {
  addOrderBy: jest.MockedFunction<(sort: string, order: string) => MockAuditQueryBuilder>;
  andWhere: jest.MockedFunction<(query: string, params: Record<string, unknown>) => MockAuditQueryBuilder>;
  getMany: jest.MockedFunction<() => Promise<AuditLog[]>>;
  orderBy: jest.MockedFunction<(sort: string, order: string) => MockAuditQueryBuilder>;
  take: jest.MockedFunction<(limit: number) => MockAuditQueryBuilder>;
  where: jest.MockedFunction<(query: string, params: Record<string, unknown>) => MockAuditQueryBuilder>;
}

const createService = () => {
  const auditLogs = new Map<string, AuditLog>();
  const auditLogsRepository = {
    create: jest.fn((value: Partial<AuditLog>) => value as AuditLog),
    createQueryBuilder: jest.fn(() => {
      const state = {
        action: undefined as AuditAction | undefined,
        cursorCreatedAt: undefined as Date | undefined,
        cursorId: undefined as string | undefined,
        environmentId: undefined as string | undefined,
        limit: 25,
        organizationId: "",
        projectId: undefined as string | undefined,
        resourceType: undefined as AuditResourceType | undefined
      };
      const builder = {} as MockAuditQueryBuilder;

      builder.addOrderBy = jest.fn((_sort: string, _order: string) => builder);
      builder.andWhere = jest.fn((_query: string, params: Record<string, unknown>) => {
        Object.assign(state, params);
        return builder;
      });
      builder.getMany = jest.fn(async () =>
        Array.from(auditLogs.values())
          .filter((auditLog) => auditLog.organizationId === state.organizationId)
          .filter((auditLog) => !state.projectId || auditLog.projectId === state.projectId)
          .filter((auditLog) => !state.environmentId || auditLog.environmentId === state.environmentId)
          .filter((auditLog) => !state.resourceType || auditLog.resourceType === state.resourceType)
          .filter((auditLog) => !state.action || auditLog.action === state.action)
          .filter((auditLog) => {
            if (!state.cursorCreatedAt || !state.cursorId) {
              return true;
            }

            return (
              auditLog.createdAt.getTime() < state.cursorCreatedAt.getTime() ||
              (auditLog.createdAt.getTime() === state.cursorCreatedAt.getTime() && auditLog.id < state.cursorId)
            );
          })
          .sort((first, second) => {
            const createdAtDiff = second.createdAt.getTime() - first.createdAt.getTime();

            return createdAtDiff || second.id.localeCompare(first.id);
          })
          .slice(0, state.limit)
      );
      builder.orderBy = jest.fn((_sort: string, _order: string) => builder);
      builder.take = jest.fn((limit: number) => {
        state.limit = limit;
        return builder;
      });
      builder.where = jest.fn((_query: string, params: Record<string, unknown>) => {
        Object.assign(state, params);
        return builder;
      });

      return builder;
    }),
    save: jest.fn(async (auditLog: AuditLog) => {
      const savedAuditLog = {
        ...auditLog,
        createdAt: auditLog.createdAt ?? now,
        id: auditLog.id ?? `audit-${auditLogs.size + 1}`
      } as AuditLog;
      auditLogs.set(savedAuditLog.id, savedAuditLog);
      return savedAuditLog;
    })
  };
  const service = new AuditService(auditLogsRepository as never);

  return { auditLogs, auditLogsRepository, service };
};

describe("AuditService", () => {
  it("records organization-scoped audit entries with sanitized snapshots", async () => {
    const { auditLogsRepository, service } = createService();

    const result = await service.record(
      user,
      {
        action: AuditAction.SdkKeyCreated,
        newValue: {
          keyPrefix: "ff_development_sk_abc",
          keyHash: "should-not-store",
          nested: { refreshToken: "hidden", visible: true },
          passwordHash: "hidden"
        },
        oldValue: null,
        projectId: "project-1",
        resourceId: "sdk-key-1",
        resourceName: "Browser app",
        resourceType: AuditResourceType.SdkKey
      },
      { ipAddress: "203.0.113.9" }
    );

    expect(result).toMatchObject({
      action: AuditAction.SdkKeyCreated,
      actorEmail: user.email,
      ipAddress: "203.0.113.9",
      organizationId: "org-1"
    });
    expect(auditLogsRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        newValue: {
          keyPrefix: "ff_development_sk_abc",
          nested: { visible: true }
        }
      })
    );
  });

  it("lists audit logs by organization, filters, newest order, and bounded pagination", async () => {
    const { auditLogs, service } = createService();
    auditLogs.set("audit-1", createAuditLog({ createdAt: new Date("2026-08-13T00:00:01.000Z"), id: "audit-1" }));
    auditLogs.set(
      "audit-2",
      createAuditLog({
        action: AuditAction.EnvironmentUpdated,
        createdAt: new Date("2026-08-13T00:00:02.000Z"),
        environmentId: "environment-1",
        id: "audit-2",
        resourceId: "environment-1",
        resourceType: AuditResourceType.Environment
      })
    );
    auditLogs.set("audit-3", createAuditLog({ id: "audit-3", organizationId: "org-2" }));
    auditLogs.set(
      "audit-4",
      createAuditLog({
        action: AuditAction.EnvironmentUpdated,
        createdAt: new Date("2026-08-13T00:00:03.000Z"),
        environmentId: "environment-1",
        id: "audit-4",
        resourceId: "environment-1",
        resourceType: AuditResourceType.Environment
      })
    );

    const result = await service.findAll(user, {
      action: AuditAction.EnvironmentUpdated,
      environmentId: "environment-1",
      limit: 1,
      projectId: "project-1",
      resourceType: AuditResourceType.Environment
    });

    expect(result.entries).toEqual([expect.objectContaining({ id: "audit-4", organizationId: "org-1" })]);
    expect(result.pagination).toMatchObject({
      hasNextPage: true,
      limit: 1,
      nextCursor: expect.any(String)
    });

    const nextPage = await service.findAll(user, {
      action: AuditAction.EnvironmentUpdated,
      cursor: result.pagination.nextCursor as string,
      environmentId: "environment-1",
      limit: 1,
      projectId: "project-1",
      resourceType: AuditResourceType.Environment
    });

    expect(nextPage.entries).toEqual([expect.objectContaining({ id: "audit-2", organizationId: "org-1" })]);
    expect(nextPage.pagination).toEqual({
      hasNextPage: false,
      limit: 1,
      nextCursor: null
    });
  });
});
