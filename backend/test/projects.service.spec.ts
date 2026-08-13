import { ConflictException, NotFoundException } from "@nestjs/common";
import { AuditAction } from "../src/audit/audit-action.enum";
import { AuditService } from "../src/audit/audit.service";
import { AuthenticatedUser } from "../src/auth/authenticated-user";
import { Environment } from "../src/environments/environment.entity";
import { Project } from "../src/projects/project.entity";
import { defaultEnvironments, ProjectsService } from "../src/projects/projects.service";
import { UserRole } from "../src/users/user-role.enum";

const now = new Date("2026-08-13T00:00:00.000Z");

const owner: AuthenticatedUser = {
  email: "owner@example.com",
  id: "user-1",
  organizationId: "org-1",
  role: UserRole.Owner
};

const createProject = (overrides: Partial<Project> = {}): Project =>
  ({
    createdAt: now,
    description: null,
    id: "project-1",
    key: "checkout",
    name: "Checkout",
    organizationId: "org-1",
    updatedAt: now,
    ...overrides
  }) as Project;

const createService = () => {
  const projects = new Map<string, Project>();
  const environments = new Map<string, Environment>();
  const auditService = {
    record: jest.fn(async (..._args: unknown[]) => undefined)
  };

  const projectsRepository = {
    create: jest.fn((value: Partial<Project>) => value as Project),
    find: jest.fn(async ({ where }: { where: Partial<Project> }) =>
      Array.from(projects.values()).filter((project) => project.organizationId === where.organizationId)
    ),
    findOne: jest.fn(async ({ where }: { where: Partial<Project> }) => {
      const values = Array.from(projects.values());

      if (where.id && where.organizationId) {
        return (
          values.find((project) => project.id === where.id && project.organizationId === where.organizationId) ?? null
        );
      }

      if (where.key && where.organizationId) {
        return (
          values.find((project) => project.key === where.key && project.organizationId === where.organizationId) ?? null
        );
      }

      return null;
    }),
    remove: jest.fn(async (project: Project) => {
      projects.delete(project.id);
      Array.from(environments.values())
        .filter((environment) => environment.projectId === project.id)
        .forEach((environment) => environments.delete(environment.id));
    }),
    save: jest.fn(async (project: Project) => {
      const savedProject = {
        ...project,
        createdAt: project.createdAt ?? now,
        id: project.id ?? `project-${projects.size + 1}`,
        updatedAt: project.updatedAt ?? now
      } as Project;
      projects.set(savedProject.id, savedProject);
      return savedProject;
    })
  };

  const environmentsRepository = {
    create: jest.fn((value: Partial<Environment>) => value as Environment),
    save: jest.fn(async (values: Environment[]) => {
      values.forEach((environment, index) => {
        const savedEnvironment = {
          ...environment,
          createdAt: now,
          id: environment.id ?? `environment-${environments.size + index + 1}`,
          updatedAt: now
        } as Environment;
        environments.set(savedEnvironment.id, savedEnvironment);
      });

      return values;
    })
  };

  const manager = {
    getRepository: (entity: unknown) => {
      if (entity === Environment) {
        return environmentsRepository;
      }

      return projectsRepository;
    }
  };

  const dataSource = {
    transaction: jest.fn((callback: (value: typeof manager) => Promise<Project>) => callback(manager))
  };

  const service = new ProjectsService(dataSource as never, auditService as unknown as AuditService, projectsRepository as never);

  return {
    auditService,
    dataSource,
    environments,
    environmentsRepository,
    projects,
    projectsRepository,
    service
  };
};

describe("ProjectsService", () => {
  it("creates an organization-scoped project with default environments", async () => {
    const { auditService, environments, service } = createService();

    const result = await service.create(owner, { description: "Payment rollout work", name: "Checkout" });

    expect(result).toMatchObject({
      description: "Payment rollout work",
      key: "checkout",
      name: "Checkout",
      organizationId: "org-1"
    });
    expect(Array.from(environments.values())).toEqual(
      expect.arrayContaining(defaultEnvironments.map((environment) => expect.objectContaining(environment)))
    );
    expect(auditService.record).toHaveBeenCalledWith(
      owner,
      expect.objectContaining({
        action: AuditAction.ProjectCreated,
        newValue: expect.objectContaining({ key: "checkout", name: "Checkout" }),
        oldValue: null,
        resourceName: "Checkout"
      }),
      undefined
    );
  });

  it("rejects duplicate project keys within an organization", async () => {
    const { auditService, projects, service } = createService();
    projects.set("project-1", createProject());

    await expect(service.create(owner, { name: "Checkout" })).rejects.toBeInstanceOf(ConflictException);
  });

  it("lists and reads only projects scoped to the current organization", async () => {
    const { auditService, projects, service } = createService();
    projects.set("project-1", createProject());
    projects.set("project-2", createProject({ id: "project-2", organizationId: "org-2" }));

    await expect(service.findAll(owner)).resolves.toHaveLength(1);
    await expect(service.findOne(owner, "project-1")).resolves.toMatchObject({ id: "project-1" });
    await expect(service.findOne(owner, "project-2")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("updates project profile fields while preserving the stable key", async () => {
    const { auditService, projects, service } = createService();
    projects.set("project-1", createProject());

    const result = await service.update(owner, "project-1", { description: "", name: "Checkout Renamed" });

    expect(result.name).toBe("Checkout Renamed");
    expect(result.description).toBeNull();
    expect(result.key).toBe("checkout");
    expect(auditService.record).toHaveBeenCalledWith(
      owner,
      expect.objectContaining({
        action: AuditAction.ProjectUpdated,
        newValue: { description: null, name: "Checkout Renamed" },
        oldValue: { description: null, name: "Checkout" }
      }),
      undefined
    );
  });

  it("deletes a project through the scoped lookup and relies on environment cascade", async () => {
    const { auditService, environments, projects, projectsRepository, service } = createService();
    projects.set("project-1", createProject());
    environments.set("environment-1", { id: "environment-1", projectId: "project-1" } as Environment);

    await service.remove(owner, "project-1");

    expect(projectsRepository.remove).toHaveBeenCalledWith(expect.objectContaining({ id: "project-1" }));
    expect(projects.has("project-1")).toBe(false);
    expect(environments.has("environment-1")).toBe(false);
    expect(auditService.record).toHaveBeenCalledWith(
      owner,
      expect.objectContaining({
        action: AuditAction.ProjectDeleted,
        oldValue: expect.objectContaining({ key: "checkout", name: "Checkout" })
      }),
      undefined
    );
  });
});
