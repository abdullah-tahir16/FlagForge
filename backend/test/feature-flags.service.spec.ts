import { ConflictException, NotFoundException } from "@nestjs/common";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { AuditAction } from "../src/audit/audit-action.enum";
import { AuditService } from "../src/audit/audit.service";
import { AuthenticatedUser } from "../src/auth/authenticated-user";
import { Environment } from "../src/environments/environment.entity";
import { UpdateEnvironmentFlagConfigDto } from "../src/feature-flags/dto/update-environment-flag-config.dto";
import { EnvironmentFlagConfig } from "../src/feature-flags/environment-flag-config.entity";
import { FeatureFlag } from "../src/feature-flags/feature-flag.entity";
import { FeatureFlagType } from "../src/feature-flags/feature-flag-type.enum";
import { FeatureFlagsService } from "../src/feature-flags/feature-flags.service";
import { ProjectsService } from "../src/projects/projects.service";
import { RealtimeEventAction } from "../src/realtime/realtime-event-action.enum";
import { RealtimeResourceType } from "../src/realtime/realtime-resource-type.enum";
import { UserRole } from "../src/users/user-role.enum";

const now = new Date("2026-08-13T00:00:00.000Z");

interface MockFeatureFlagQueryBuilder {
  addOrderBy: jest.MockedFunction<(sort: string, order: string) => MockFeatureFlagQueryBuilder>;
  andWhere: jest.MockedFunction<(query: string, params: { flagId?: string; projectId?: string }) => MockFeatureFlagQueryBuilder>;
  getMany: jest.MockedFunction<() => Promise<FeatureFlag[]>>;
  getOne: jest.MockedFunction<() => Promise<FeatureFlag | null>>;
  leftJoinAndSelect: jest.MockedFunction<(relation: string, alias: string) => MockFeatureFlagQueryBuilder>;
  orderBy: jest.MockedFunction<(sort: string, order: string) => MockFeatureFlagQueryBuilder>;
  where: jest.MockedFunction<(query: string, params: { flagId?: string; projectId?: string }) => MockFeatureFlagQueryBuilder>;
}

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

const createFeatureFlag = (overrides: Partial<FeatureFlag> = {}): FeatureFlag =>
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
    enabled: false,
    environmentId: "environment-1",
    featureFlagId: "flag-1",
    id: "config-1",
    rolloutPercentage: 100,
    updatedAt: now,
    value: false,
    ...overrides
  }) as EnvironmentFlagConfig;

const createService = (
  realtimePublisherOverride?: {
    publishConfigurationChanged: jest.Mock;
  }
) => {
  const configs = new Map<string, EnvironmentFlagConfig>();
  const environments = new Map<string, Environment>();
  const featureFlags = new Map<string, FeatureFlag>();
  const projectsService = {
    findProjectForUser: jest.fn(async () => ({ id: "project-1", organizationId: "org-1" }))
  };
  const auditService = {
    record: jest.fn(async (..._args: unknown[]) => undefined)
  };
  const evaluationCacheService = {
    deleteEnvironmentSnapshot: jest.fn(async () => undefined),
    deleteEnvironmentSnapshots: jest.fn(async () => undefined)
  };
  const realtimePublisher = realtimePublisherOverride ?? {
    publishConfigurationChanged: jest.fn()
  };

  const withRelations = (featureFlag: FeatureFlag): FeatureFlag => {
    const environmentConfigs = Array.from(configs.values())
      .filter((config) => config.featureFlagId === featureFlag.id)
      .map((config) => ({
        ...config,
        environment: environments.get(config.environmentId)
      })) as EnvironmentFlagConfig[];

    return {
      ...featureFlag,
      environmentConfigs
    } as FeatureFlag;
  };

  const featureFlagsRepository = {
    create: jest.fn((value: Partial<FeatureFlag>) => value as FeatureFlag),
    createQueryBuilder: jest.fn(() => {
      const state = { flagId: "", projectId: "" };
      const builder = {} as MockFeatureFlagQueryBuilder;

      builder.addOrderBy = jest.fn((_sort: string, _order: string) => builder);
      builder.andWhere = jest.fn((_query: string, params: { flagId?: string; projectId?: string }) => {
        state.flagId = params.flagId ?? state.flagId;
        state.projectId = params.projectId ?? state.projectId;
        return builder;
      });
      builder.getMany = jest.fn(async () =>
        Array.from(featureFlags.values())
          .filter((featureFlag) => featureFlag.projectId === state.projectId)
          .sort((first, second) => second.createdAt.getTime() - first.createdAt.getTime())
          .map(withRelations)
      );
      builder.getOne = jest.fn(async () => {
        const featureFlag = Array.from(featureFlags.values()).find(
          (value) => value.id === state.flagId && value.projectId === state.projectId
        );

        return featureFlag ? withRelations(featureFlag) : null;
      });
      builder.leftJoinAndSelect = jest.fn((_relation: string, _alias: string) => builder);
      builder.orderBy = jest.fn((_sort: string, _order: string) => builder);
      builder.where = jest.fn((_query: string, params: { flagId?: string; projectId?: string }) => {
        state.flagId = params.flagId ?? state.flagId;
        state.projectId = params.projectId ?? state.projectId;
        return builder;
      });

      return builder;
    }),
    findOne: jest.fn(async ({ where }: { where: Partial<FeatureFlag> }) =>
      Array.from(featureFlags.values()).find(
        (featureFlag) =>
          (!where.id || featureFlag.id === where.id) &&
          (!where.key || featureFlag.key === where.key) &&
          (!where.projectId || featureFlag.projectId === where.projectId)
      )
    ),
    remove: jest.fn(async (featureFlag: FeatureFlag) => {
      featureFlags.delete(featureFlag.id);
      Array.from(configs.values())
        .filter((config) => config.featureFlagId === featureFlag.id)
        .forEach((config) => configs.delete(config.id));
      Object.assign(featureFlag, { id: undefined });
    }),
    save: jest.fn(async (featureFlag: FeatureFlag) => {
      const savedFlag = {
        ...featureFlag,
        createdAt: featureFlag.createdAt ?? now,
        id: featureFlag.id ?? `flag-${featureFlags.size + 1}`,
        updatedAt: featureFlag.updatedAt ?? now
      } as FeatureFlag;
      featureFlags.set(savedFlag.id, savedFlag);
      return savedFlag;
    })
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
    )
  };

  const configsRepository = {
    create: jest.fn((value: Partial<EnvironmentFlagConfig>) => value as EnvironmentFlagConfig),
    findOne: jest.fn(async ({ where }: { where: Partial<EnvironmentFlagConfig> }) => {
      const config = Array.from(configs.values()).find(
        (value) => value.environmentId === where.environmentId && value.featureFlagId === where.featureFlagId
      );

      return config ? ({ ...config, environment: environments.get(config.environmentId) } as EnvironmentFlagConfig) : null;
    }),
    save: jest.fn(async (value: EnvironmentFlagConfig | EnvironmentFlagConfig[]) => {
      const values = Array.isArray(value) ? value : [value];

      values.forEach((config, index) => {
        const savedConfig = {
          ...config,
          createdAt: config.createdAt ?? now,
          id: config.id ?? `config-${configs.size + index + 1}`,
          updatedAt: config.updatedAt ?? now
        } as EnvironmentFlagConfig;
        configs.set(savedConfig.id, savedConfig);
      });

      return value;
    })
  };

  const manager = {
    getRepository: (entity: unknown) => {
      if (entity === Environment) {
        return environmentsRepository;
      }

      if (entity === EnvironmentFlagConfig) {
        return configsRepository;
      }

      return featureFlagsRepository;
    }
  };
  const dataSource = {
    transaction: jest.fn((callback: (value: typeof manager) => Promise<FeatureFlag>) => callback(manager))
  };
  const service = new FeatureFlagsService(
    dataSource as never,
    projectsService as unknown as ProjectsService,
    auditService as unknown as AuditService,
    evaluationCacheService as never,
    realtimePublisher as never,
    environmentsRepository as never,
    configsRepository as never,
    featureFlagsRepository as never
  );

  return {
    configs,
    configsRepository,
    auditService,
    dataSource,
    evaluationCacheService,
    environments,
    featureFlags,
    featureFlagsRepository,
    projectsService,
    realtimePublisher,
    service
  };
};

describe("FeatureFlagsService", () => {
  it("creates a project-scoped boolean feature flag with default environment configs", async () => {
    const { auditService, configs, environments, evaluationCacheService, realtimePublisher, service } = createService();
    environments.set("environment-2", createEnvironment({ id: "environment-2", key: "staging", sortOrder: 20 }));
    environments.set("environment-1", createEnvironment());

    const result = await service.create(owner, "project-1", {
      description: "  Checkout rollout  ",
      name: "New Checkout"
    });

    expect(result).toMatchObject({
      description: "Checkout rollout",
      key: "new-checkout",
      name: "New Checkout",
      projectId: "project-1",
      type: FeatureFlagType.Boolean
    });
    expect(result.environmentConfigs).toHaveLength(2);
    expect(Array.from(configs.values())).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ enabled: false, environmentId: "environment-1", value: false }),
        expect.objectContaining({ enabled: false, environmentId: "environment-2", value: false })
      ])
    );
    expect(auditService.record).toHaveBeenCalledWith(
      owner,
      expect.objectContaining({
        action: AuditAction.FeatureFlagCreated,
        newValue: expect.objectContaining({ key: "new-checkout", name: "New Checkout" }),
        projectId: "project-1"
      }),
      undefined
    );
    expect(evaluationCacheService.deleteEnvironmentSnapshots).toHaveBeenCalledWith(["environment-1", "environment-2"]);
    expect(realtimePublisher.publishConfigurationChanged).toHaveBeenCalledWith({
      action: RealtimeEventAction.Created,
      environmentIds: ["environment-1", "environment-2"],
      organizationId: "org-1",
      projectId: "project-1",
      resourceId: result.id,
      resourceType: RealtimeResourceType.FeatureFlag
    });
  });

  it("does not fail successful writes when realtime publishing fails", async () => {
    const realtimePublisher = {
      publishConfigurationChanged: jest.fn(() => {
        throw new Error("realtime unavailable");
      })
    };
    const { environments, service } = createService(realtimePublisher);
    environments.set("environment-1", createEnvironment());

    await expect(
      service.create(owner, "project-1", {
        name: "Fault Tolerant Flag"
      })
    ).resolves.toMatchObject({ key: "fault-tolerant-flag" });
    expect(realtimePublisher.publishConfigurationChanged).toHaveBeenCalled();
  });

  it("rejects duplicate keys and uses a transaction for atomic config creation", async () => {
    const { configsRepository, dataSource, featureFlags, service } = createService();
    featureFlags.set("flag-1", createFeatureFlag());

    await expect(service.create(owner, "project-1", { name: "New Checkout" })).rejects.toBeInstanceOf(
      ConflictException
    );

    featureFlags.clear();
    configsRepository.save.mockRejectedValueOnce(new Error("config write failed"));

    await expect(service.create(owner, "project-1", { name: "New Checkout" })).rejects.toThrow("config write failed");
    expect(dataSource.transaction).toHaveBeenCalled();
  });

  it("lists, reads, updates, and deletes project feature flags", async () => {
    const { auditService, configs, environments, evaluationCacheService, featureFlags, featureFlagsRepository, service } =
      createService();
    environments.set("environment-1", createEnvironment());
    featureFlags.set("flag-1", createFeatureFlag());
    configs.set("config-1", createConfig());

    await expect(service.findAll(owner, "project-1")).resolves.toHaveLength(1);
    await expect(service.findOne(owner, "project-1", "flag-1")).resolves.toMatchObject({
      environmentConfigs: [expect.objectContaining({ environmentKey: "development" })],
      id: "flag-1"
    });

    const updated = await service.update(owner, "project-1", "flag-1", { description: "", name: "Renamed" });

    expect(updated.name).toBe("Renamed");
    expect(updated.key).toBe("new-checkout");
    expect(updated.description).toBeNull();
    expect(auditService.record).toHaveBeenCalledWith(
      owner,
      expect.objectContaining({
        action: AuditAction.FeatureFlagUpdated,
        newValue: { description: null, name: "Renamed" },
        oldValue: { description: null, name: "New Checkout" }
      }),
      undefined
    );
    expect(evaluationCacheService.deleteEnvironmentSnapshots).toHaveBeenCalledWith(["environment-1"]);

    await service.remove(owner, "project-1", "flag-1");

    expect(featureFlagsRepository.remove).toHaveBeenCalledTimes(1);
    expect(featureFlags.has("flag-1")).toBe(false);
    expect(configs.has("config-1")).toBe(false);
    expect(auditService.record).toHaveBeenCalledWith(
      owner,
      expect.objectContaining({
        action: AuditAction.FeatureFlagDeleted,
        oldValue: expect.objectContaining({ key: "new-checkout", name: "Renamed" }),
        resourceId: "flag-1"
      }),
      undefined
    );
    expect(evaluationCacheService.deleteEnvironmentSnapshots).toHaveBeenLastCalledWith(["environment-1"]);
  });

  it("updates environment configuration and rejects ownership mismatches", async () => {
    const { auditService, configs, environments, evaluationCacheService, featureFlags, projectsService, service } =
      createService();
    environments.set("environment-1", createEnvironment());
    featureFlags.set("flag-1", createFeatureFlag());
    configs.set("config-1", createConfig());

    const updated = await service.updateEnvironmentConfig(owner, "project-1", "flag-1", "environment-1", {
      enabled: true,
      rolloutPercentage: 25,
      value: true
    });

    expect(updated.environmentConfigs[0]).toMatchObject({ enabled: true, rolloutPercentage: 25, value: true });
    expect(auditService.record).toHaveBeenCalledWith(
      owner,
      expect.objectContaining({
        action: AuditAction.FeatureFlagConfigUpdated,
        environmentId: "environment-1",
        newValue: { enabled: true, rolloutPercentage: 25, value: true },
        oldValue: { enabled: false, rolloutPercentage: 100, value: false },
        projectId: "project-1"
      }),
      undefined
    );
    expect(evaluationCacheService.deleteEnvironmentSnapshot).toHaveBeenCalledWith("environment-1");

    await expect(
      service.updateEnvironmentConfig(owner, "project-1", "flag-1", "missing-environment", { enabled: false })
    ).rejects.toBeInstanceOf(NotFoundException);

    projectsService.findProjectForUser.mockRejectedValueOnce(new NotFoundException("Project was not found"));

    await expect(service.findAll(owner, "project-2")).rejects.toBeInstanceOf(NotFoundException);
  });

  it("validates rollout percentage update bounds", async () => {
    await expect(
      validate(plainToInstance(UpdateEnvironmentFlagConfigDto, { rolloutPercentage: 0 }))
    ).resolves.toHaveLength(0);
    await expect(
      validate(plainToInstance(UpdateEnvironmentFlagConfigDto, { rolloutPercentage: 100 }))
    ).resolves.toHaveLength(0);
    await expect(
      validate(plainToInstance(UpdateEnvironmentFlagConfigDto, { rolloutPercentage: -1 }))
    ).resolves.not.toHaveLength(0);
    await expect(
      validate(plainToInstance(UpdateEnvironmentFlagConfigDto, { rolloutPercentage: 101 }))
    ).resolves.not.toHaveLength(0);
    await expect(
      validate(plainToInstance(UpdateEnvironmentFlagConfigDto, { rolloutPercentage: 12.5 }))
    ).resolves.not.toHaveLength(0);
  });

  it("rejects feature flag ids that do not belong to the selected project", async () => {
    const { featureFlags, service } = createService();
    featureFlags.set("flag-1", createFeatureFlag({ projectId: "project-2" }));

    await expect(service.findOne(owner, "project-1", "flag-1")).rejects.toBeInstanceOf(NotFoundException);
    await expect(service.remove(owner, "project-1", "flag-1")).rejects.toBeInstanceOf(NotFoundException);
  });
});
