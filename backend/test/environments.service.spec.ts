import { NotFoundException } from "@nestjs/common";
import { AuditAction } from "../src/audit/audit-action.enum";
import { AuditService } from "../src/audit/audit.service";
import { AuthenticatedUser } from "../src/auth/authenticated-user";
import { Environment } from "../src/environments/environment.entity";
import { EnvironmentsService } from "../src/environments/environments.service";
import { ProjectsService } from "../src/projects/projects.service";
import { UserRole } from "../src/users/user-role.enum";

const now = new Date("2026-08-13T00:00:00.000Z");

const owner: AuthenticatedUser = {
  email: "owner@example.com",
  id: "user-1",
  organizationId: "org-1",
  role: UserRole.Owner
};

const createEnvironment = (overrides: Partial<Environment> = {}): Environment =>
  ({
    createdAt: now,
    id: "environment-1",
    key: "development",
    name: "Development",
    projectId: "project-1",
    sortOrder: 10,
    updatedAt: now,
    ...overrides
  }) as Environment;

const createService = () => {
  const environments = new Map<string, Environment>();
  const projectsService = {
    findProjectForUser: jest.fn(async () => ({ id: "project-1", organizationId: "org-1" }))
  };
  const auditService = {
    record: jest.fn(async (..._args: unknown[]) => undefined)
  };
  const environmentsRepository = {
    find: jest.fn(async ({ where }: { where: Partial<Environment> }) =>
      Array.from(environments.values())
        .filter((environment) => environment.projectId === where.projectId)
        .sort((first, second) => first.sortOrder - second.sortOrder)
    ),
    findOne: jest.fn(async ({ where }: { where: Partial<Environment> }) =>
      Array.from(environments.values()).find(
        (environment) => environment.id === where.id && environment.projectId === where.projectId
      )
    ),
    save: jest.fn(async (environment: Environment) => {
      environments.set(environment.id, environment);
      return environment;
    })
  };
  const service = new EnvironmentsService(
    projectsService as unknown as ProjectsService,
    auditService as unknown as AuditService,
    environmentsRepository as never
  );

  return {
    auditService,
    environments,
    environmentsRepository,
    projectsService,
    service
  };
};

describe("EnvironmentsService", () => {
  it("lists environments by project sort order after scoped project lookup", async () => {
    const { environments, projectsService, service } = createService();
    environments.set("environment-3", createEnvironment({ id: "environment-3", key: "production", sortOrder: 30 }));
    environments.set("environment-1", createEnvironment({ id: "environment-1", key: "development", sortOrder: 10 }));
    environments.set("environment-2", createEnvironment({ id: "environment-2", key: "staging", sortOrder: 20 }));

    const result = await service.findAll(owner, "project-1");

    expect(projectsService.findProjectForUser).toHaveBeenCalledWith(owner, "project-1");
    expect(result.map((environment) => environment.key)).toEqual(["development", "staging", "production"]);
  });

  it("updates environment name while preserving the stable key", async () => {
    const { auditService, environments, service } = createService();
    environments.set("environment-1", createEnvironment());

    const result = await service.update(owner, "project-1", "environment-1", { name: "Local" });

    expect(result.name).toBe("Local");
    expect(result.key).toBe("development");
    expect(auditService.record).toHaveBeenCalledWith(
      owner,
      expect.objectContaining({
        action: AuditAction.EnvironmentUpdated,
        environmentId: "environment-1",
        newValue: { name: "Local" },
        oldValue: { name: "Development" },
        projectId: "project-1"
      }),
      undefined
    );
  });

  it("rejects missing environments and cross-organization project access", async () => {
    const { projectsService, service } = createService();

    await expect(service.update(owner, "project-1", "missing", { name: "Local" })).rejects.toBeInstanceOf(
      NotFoundException
    );

    projectsService.findProjectForUser.mockRejectedValueOnce(new NotFoundException("Project was not found"));

    await expect(service.findAll(owner, "project-2")).rejects.toBeInstanceOf(NotFoundException);
  });
});
