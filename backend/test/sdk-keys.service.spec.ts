import { NotFoundException } from "@nestjs/common";
import { AuditAction } from "../src/audit/audit-action.enum";
import { AuditService } from "../src/audit/audit.service";
import { AuthenticatedUser } from "../src/auth/authenticated-user";
import { Environment } from "../src/environments/environment.entity";
import { ProjectsService } from "../src/projects/projects.service";
import { SdkKey } from "../src/sdk-keys/sdk-key.entity";
import { SdkKeySecretService } from "../src/sdk-keys/sdk-key-secret.service";
import { SdkKeysService } from "../src/sdk-keys/sdk-keys.service";
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

const createSdkKey = (overrides: Partial<SdkKey> = {}): SdkKey =>
  ({
    createdAt: now,
    environmentId: "environment-1",
    id: "sdk-key-1",
    keyHash: "hashed-secret",
    keyPrefix: "ff_development_sk_fix",
    lastUsedAt: null,
    name: "Demo key",
    revokedAt: null,
    updatedAt: now,
    ...overrides
  }) as SdkKey;

const createService = () => {
  const environments = new Map<string, Environment>();
  const sdkKeys = new Map<string, SdkKey>();
  const projectsService = {
    findProjectForUser: jest.fn(async () => ({ id: "project-1", organizationId: "org-1" }))
  };
  const secretService = {
    generate: jest.fn(() => "ff_development_sk_fixed-secret"),
    hash: jest.fn((secret: string) => `hashed-${secret}`),
    prefix: jest.fn((secret: string) => secret.slice(0, 20))
  };
  const auditService = {
    record: jest.fn(async (..._args: unknown[]) => undefined)
  };
  const environmentsRepository = {
    findOne: jest.fn(async ({ where }: { where: Partial<Environment> }) =>
      Array.from(environments.values()).find(
        (environment) => environment.id === where.id && environment.projectId === where.projectId
      )
    )
  };
  const sdkKeysRepository = {
    create: jest.fn((value: Partial<SdkKey>) => value as SdkKey),
    find: jest.fn(async ({ where }: { where: Partial<SdkKey> }) =>
      Array.from(sdkKeys.values())
        .filter((sdkKey) => sdkKey.environmentId === where.environmentId)
        .sort((first, second) => second.createdAt.getTime() - first.createdAt.getTime())
    ),
    findOne: jest.fn(async ({ where }: { where: Partial<SdkKey> }) =>
      Array.from(sdkKeys.values()).find((sdkKey) => {
        const matchesRevocation = where.revokedAt === undefined || sdkKey.revokedAt === null;

        return (
          (!where.id || sdkKey.id === where.id) &&
          (!where.environmentId || sdkKey.environmentId === where.environmentId) &&
          (!where.keyHash || sdkKey.keyHash === where.keyHash) &&
          matchesRevocation
        );
      }) ?? null
    ),
    save: jest.fn(async (sdkKey: SdkKey) => {
      const savedSdkKey = {
        ...sdkKey,
        createdAt: sdkKey.createdAt ?? now,
        id: sdkKey.id ?? `sdk-key-${sdkKeys.size + 1}`,
        updatedAt: sdkKey.updatedAt ?? now
      } as SdkKey;
      sdkKeys.set(savedSdkKey.id, savedSdkKey);
      return savedSdkKey;
    })
  };
  const service = new SdkKeysService(
    projectsService as unknown as ProjectsService,
    secretService as unknown as SdkKeySecretService,
    auditService as unknown as AuditService,
    environmentsRepository as never,
    sdkKeysRepository as never
  );

  return {
    environments,
    environmentsRepository,
    auditService,
    projectsService,
    sdkKeys,
    sdkKeysRepository,
    secretService,
    service
  };
};

describe("SdkKeysService", () => {
  it("creates an environment-scoped SDK key and returns the secret once", async () => {
    const { auditService, environments, sdkKeys, sdkKeysRepository, service } = createService();
    environments.set("environment-1", createEnvironment());

    const result = await service.create(owner, "project-1", "environment-1", { name: "  Browser app  " });
    const persisted = Array.from(sdkKeys.values())[0];

    expect(result).toMatchObject({
      environmentId: "environment-1",
      key: "ff_development_sk_fixed-secret",
      keyPrefix: "ff_development_sk_fi",
      name: "Browser app",
      revokedAt: null
    });
    expect(persisted).toMatchObject({
      environmentId: "environment-1",
      keyHash: "hashed-ff_development_sk_fixed-secret",
      keyPrefix: "ff_development_sk_fi",
      name: "Browser app"
    });
    expect(sdkKeysRepository.save).not.toHaveBeenCalledWith(expect.objectContaining({ key: expect.any(String) }));
    expect(auditService.record).toHaveBeenCalledWith(
      owner,
      expect.objectContaining({
        action: AuditAction.SdkKeyCreated,
        newValue: expect.objectContaining({
          keyPrefix: "ff_development_sk_fi",
          name: "Browser app"
        })
      }),
      undefined
    );
    const auditRecordInput = auditService.record.mock.calls[0]?.[1] as { newValue: Record<string, unknown> };
    expect(auditRecordInput.newValue).not.toHaveProperty("key");
    expect(auditRecordInput.newValue).not.toHaveProperty("keyHash");
  });

  it("lists SDK key metadata without raw secret or hash fields", async () => {
    const { environments, sdkKeys, service } = createService();
    environments.set("environment-1", createEnvironment());
    sdkKeys.set("sdk-key-1", createSdkKey());

    const result = await service.findAll(owner, "project-1", "environment-1");

    expect(result).toEqual([
      expect.objectContaining({
        id: "sdk-key-1",
        keyPrefix: "ff_development_sk_fix",
        name: "Demo key"
      })
    ]);
    expect(result[0]).not.toHaveProperty("key");
    expect(result[0]).not.toHaveProperty("keyHash");
  });

  it("revokes an SDK key by setting revokedAt", async () => {
    const { auditService, environments, sdkKeys, service } = createService();
    environments.set("environment-1", createEnvironment());
    sdkKeys.set("sdk-key-1", createSdkKey());

    await service.revoke(owner, "project-1", "environment-1", "sdk-key-1");

    expect(sdkKeys.get("sdk-key-1")?.revokedAt).toBeInstanceOf(Date);
    expect(auditService.record).toHaveBeenCalledWith(
      owner,
      expect.objectContaining({
        action: AuditAction.SdkKeyRevoked,
        oldValue: expect.objectContaining({ revokedAt: null })
      }),
      undefined
    );
  });

  it("rejects environments and keys outside the selected project scope", async () => {
    const { environments, sdkKeys, service } = createService();
    environments.set("environment-1", createEnvironment({ projectId: "other-project" }));
    sdkKeys.set("sdk-key-1", createSdkKey());

    await expect(service.findAll(owner, "project-1", "environment-1")).rejects.toBeInstanceOf(NotFoundException);

    environments.set("environment-2", createEnvironment({ id: "environment-2" }));
    await expect(service.revoke(owner, "project-1", "environment-2", "sdk-key-1")).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it("finds active SDK keys by hashed secret and tracks usage", async () => {
    const { sdkKeys, service } = createService();
    sdkKeys.set("sdk-key-1", createSdkKey({ keyHash: "hashed-secret-value" }));

    await expect(service.findActiveBySecret("secret-value")).resolves.toMatchObject({ id: "sdk-key-1" });
    const used = await service.markUsed(sdkKeys.get("sdk-key-1") as SdkKey);

    expect(used.lastUsedAt).toBeInstanceOf(Date);
  });
});
