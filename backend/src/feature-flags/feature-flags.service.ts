import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";
import type { AuditContext, AuditSnapshot } from "../audit/audit-context";
import { AuditAction } from "../audit/audit-action.enum";
import { AuditResourceType } from "../audit/audit-resource-type.enum";
import { AuditService } from "../audit/audit.service";
import { AuthenticatedUser } from "../auth/authenticated-user";
import { EvaluationCacheService } from "../common/cache/evaluation-cache.service";
import { createKeyFromName } from "../common/fns/create-key-from-name";
import { Environment } from "../environments/environment.entity";
import { ProjectsService } from "../projects/projects.service";
import { RealtimeEventAction } from "../realtime/realtime-event-action.enum";
import type { PublishConfigurationChangedInput } from "../realtime/realtime-event.type";
import { RealtimeResourceType } from "../realtime/realtime-resource-type.enum";
import { RealtimePublisherService } from "../realtime/realtime-publisher.service";
import { CreateFeatureFlagDto } from "./dto/create-feature-flag.dto";
import { FeatureFlagResponse } from "./dto/feature-flag-response.dto";
import { UpdateEnvironmentFlagConfigDto } from "./dto/update-environment-flag-config.dto";
import { UpdateFeatureFlagDto } from "./dto/update-feature-flag.dto";
import { EnvironmentFlagConfig } from "./environment-flag-config.entity";
import { FeatureFlag } from "./feature-flag.entity";
import { FeatureFlagType } from "./feature-flag-type.enum";

@Injectable()
export class FeatureFlagsService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly projectsService: ProjectsService,
    private readonly auditService: AuditService,
    private readonly evaluationCacheService: EvaluationCacheService,
    private readonly realtimePublisher: RealtimePublisherService,
    @InjectRepository(Environment)
    private readonly environmentsRepository: Repository<Environment>,
    @InjectRepository(EnvironmentFlagConfig)
    private readonly environmentFlagConfigsRepository: Repository<EnvironmentFlagConfig>,
    @InjectRepository(FeatureFlag)
    private readonly featureFlagsRepository: Repository<FeatureFlag>
  ) {}

  async create(
    user: AuthenticatedUser,
    projectId: string,
    dto: CreateFeatureFlagDto,
    auditContext?: AuditContext
  ): Promise<FeatureFlagResponse> {
    await this.projectsService.findProjectForUser(user, projectId);

    const name = dto.name.trim();
    const key = createKeyFromName(name);

    if (!key) {
      throw new ConflictException("Feature flag key could not be generated");
    }

    const existingFlag = await this.featureFlagsRepository.findOne({ where: { key, projectId } });

    if (existingFlag) {
      throw new ConflictException("A feature flag with this key already exists");
    }

    const created = await this.dataSource.transaction(async (manager) => {
      const featureFlagsRepository = manager.getRepository(FeatureFlag);
      const environmentsRepository = manager.getRepository(Environment);
      const configsRepository = manager.getRepository(EnvironmentFlagConfig);

      const savedFlag = await featureFlagsRepository.save(
        featureFlagsRepository.create({
          description: this.normalizeDescription(dto.description),
          key,
          name,
          projectId,
          type: FeatureFlagType.Boolean
        })
      );

      const environments = await environmentsRepository.find({
        order: { sortOrder: "ASC" },
        where: { projectId }
      });

      const savedConfigs = await configsRepository.save(
        environments.map((environment) =>
          configsRepository.create({
            enabled: false,
            environmentId: environment.id,
            featureFlagId: savedFlag.id,
            rolloutPercentage: 100,
            value: false
          })
        )
      );

      return { environmentIds: savedConfigs.map((config) => config.environmentId), featureFlag: savedFlag };
    });

    const response = await this.findOne(user, projectId, created.featureFlag.id);
    await this.auditService.record(
      user,
      {
        action: AuditAction.FeatureFlagCreated,
        newValue: this.featureFlagSnapshot(response),
        oldValue: null,
        projectId,
        resourceId: response.id,
        resourceName: response.name,
        resourceType: AuditResourceType.FeatureFlag
      },
      auditContext
    );
    await this.evaluationCacheService.deleteEnvironmentSnapshots(created.environmentIds);
    this.publishConfigurationChanged({
      action: RealtimeEventAction.Created,
      environmentIds: created.environmentIds,
      organizationId: user.organizationId,
      projectId,
      resourceId: response.id,
      resourceType: RealtimeResourceType.FeatureFlag
    });

    return response;
  }

  async findAll(user: AuthenticatedUser, projectId: string): Promise<FeatureFlagResponse[]> {
    await this.projectsService.findProjectForUser(user, projectId);

    const featureFlags = await this.featureFlagsRepository
      .createQueryBuilder("featureFlag")
      .leftJoinAndSelect("featureFlag.environmentConfigs", "environmentConfig")
      .leftJoinAndSelect("environmentConfig.environment", "environment")
      .where("featureFlag.project_id = :projectId", { projectId })
      .orderBy("featureFlag.created_at", "DESC")
      .addOrderBy("environment.sort_order", "ASC")
      .getMany();

    return featureFlags.map((featureFlag) => this.toResponse(featureFlag));
  }

  async findOne(user: AuthenticatedUser, projectId: string, flagId: string): Promise<FeatureFlagResponse> {
    await this.projectsService.findProjectForUser(user, projectId);
    const featureFlag = await this.findFeatureFlagForProject(projectId, flagId);

    return this.toResponse(featureFlag);
  }

  async update(
    user: AuthenticatedUser,
    projectId: string,
    flagId: string,
    dto: UpdateFeatureFlagDto,
    auditContext?: AuditContext
  ): Promise<FeatureFlagResponse> {
    await this.projectsService.findProjectForUser(user, projectId);
    const featureFlag = await this.findFeatureFlagForProject(projectId, flagId);
    const oldValue = this.changedFeatureFlagSnapshot(featureFlag, dto);

    if (dto.name !== undefined) {
      featureFlag.name = dto.name.trim();
    }

    if (dto.description !== undefined) {
      featureFlag.description = this.normalizeDescription(dto.description);
    }

    await this.featureFlagsRepository.save(featureFlag);

    const response = await this.findOne(user, projectId, flagId);
    await this.auditService.record(
      user,
      {
        action: AuditAction.FeatureFlagUpdated,
        newValue: this.changedFeatureFlagSnapshot(response, dto),
        oldValue,
        projectId,
        resourceId: response.id,
        resourceName: response.name,
        resourceType: AuditResourceType.FeatureFlag
      },
      auditContext
    );
    await this.evaluationCacheService.deleteEnvironmentSnapshots(response.environmentConfigs.map((config) => config.environmentId));
    this.publishConfigurationChanged({
      action: RealtimeEventAction.Updated,
      environmentIds: response.environmentConfigs.map((config) => config.environmentId),
      organizationId: user.organizationId,
      projectId,
      resourceId: response.id,
      resourceType: RealtimeResourceType.FeatureFlag
    });

    return response;
  }

  async remove(user: AuthenticatedUser, projectId: string, flagId: string, auditContext?: AuditContext): Promise<void> {
    await this.projectsService.findProjectForUser(user, projectId);
    const featureFlag = await this.findFeatureFlagForProject(projectId, flagId);

    if (!featureFlag) {
      throw new NotFoundException("Feature flag was not found");
    }

    const oldValue = this.featureFlagSnapshot(featureFlag);
    const resourceId = featureFlag.id;
    const resourceName = featureFlag.name;
    const environmentIds = (featureFlag.environmentConfigs ?? []).map((config) => config.environmentId);

    await this.featureFlagsRepository.remove(featureFlag);
    await this.auditService.record(
      user,
      {
        action: AuditAction.FeatureFlagDeleted,
        newValue: null,
        oldValue,
        projectId,
        resourceId,
        resourceName,
        resourceType: AuditResourceType.FeatureFlag
      },
      auditContext
    );
    await this.evaluationCacheService.deleteEnvironmentSnapshots(environmentIds);
    this.publishConfigurationChanged({
      action: RealtimeEventAction.Deleted,
      environmentIds,
      organizationId: user.organizationId,
      projectId,
      resourceId,
      resourceType: RealtimeResourceType.FeatureFlag
    });
  }

  async updateEnvironmentConfig(
    user: AuthenticatedUser,
    projectId: string,
    flagId: string,
    environmentId: string,
    dto: UpdateEnvironmentFlagConfigDto,
    auditContext?: AuditContext
  ): Promise<FeatureFlagResponse> {
    await this.projectsService.findProjectForUser(user, projectId);
    const featureFlag = await this.findFeatureFlagForProject(projectId, flagId);

    const environment = await this.environmentsRepository.findOne({ where: { id: environmentId, projectId } });

    if (!environment) {
      throw new NotFoundException("Environment was not found");
    }

    const config = await this.environmentFlagConfigsRepository.findOne({
      relations: { environment: true },
      where: { environmentId, featureFlagId: flagId }
    });

    if (!config) {
      throw new NotFoundException("Environment flag configuration was not found");
    }

    const oldValue = this.changedEnvironmentConfigSnapshot(config, dto);

    if (dto.enabled !== undefined) {
      config.enabled = dto.enabled;
    }

    if (dto.value !== undefined) {
      config.value = dto.value;
    }

    if (dto.rolloutPercentage !== undefined) {
      config.rolloutPercentage = dto.rolloutPercentage;
    }

    await this.environmentFlagConfigsRepository.save(config);
    await this.auditService.record(
      user,
      {
        action: AuditAction.FeatureFlagConfigUpdated,
        environmentId,
        newValue: this.changedEnvironmentConfigSnapshot(config, dto),
        oldValue,
        projectId,
        resourceId: config.id,
        resourceName: `${featureFlag.name} in ${environment.name}`,
        resourceType: AuditResourceType.EnvironmentFlagConfig
      },
      auditContext
    );
    await this.evaluationCacheService.deleteEnvironmentSnapshot(environmentId);
    this.publishConfigurationChanged({
      action: RealtimeEventAction.Updated,
      environmentIds: [environmentId],
      organizationId: user.organizationId,
      projectId,
      resourceId: config.id,
      resourceType: RealtimeResourceType.EnvironmentFlagConfig
    });

    return this.findOne(user, projectId, flagId);
  }

  private async findFeatureFlagForProject(projectId: string, flagId: string): Promise<FeatureFlag> {
    const featureFlag = await this.featureFlagsRepository
      .createQueryBuilder("featureFlag")
      .leftJoinAndSelect("featureFlag.environmentConfigs", "environmentConfig")
      .leftJoinAndSelect("environmentConfig.environment", "environment")
      .where("featureFlag.id = :flagId", { flagId })
      .andWhere("featureFlag.project_id = :projectId", { projectId })
      .orderBy("environment.sort_order", "ASC")
      .getOne();

    if (!featureFlag) {
      throw new NotFoundException("Feature flag was not found");
    }

    return featureFlag;
  }

  private publishConfigurationChanged(input: PublishConfigurationChangedInput): void {
    try {
      this.realtimePublisher.publishConfigurationChanged(input);
    } catch {
      // Realtime notifications are best-effort and must not fail successful management writes.
    }
  }

  private toResponse(featureFlag: FeatureFlag): FeatureFlagResponse {
    return {
      createdAt: featureFlag.createdAt,
      description: featureFlag.description,
      environmentConfigs: [...(featureFlag.environmentConfigs ?? [])]
        .sort((first, second) => (first.environment?.sortOrder ?? 0) - (second.environment?.sortOrder ?? 0))
        .map((config) => ({
          createdAt: config.createdAt,
          enabled: config.enabled,
          environmentId: config.environmentId,
          environmentKey: config.environment?.key ?? "",
          environmentName: config.environment?.name ?? "",
          id: config.id,
          rolloutPercentage: config.rolloutPercentage,
          updatedAt: config.updatedAt,
          value: config.value
        })),
      id: featureFlag.id,
      key: featureFlag.key,
      name: featureFlag.name,
      projectId: featureFlag.projectId,
      type: featureFlag.type,
      updatedAt: featureFlag.updatedAt
    };
  }

  private normalizeDescription(description: string | null | undefined): string | null {
    if (description === null || description === undefined) {
      return null;
    }

    const trimmedDescription = description.trim();

    return trimmedDescription ? trimmedDescription : null;
  }

  private changedEnvironmentConfigSnapshot(
    config: EnvironmentFlagConfig,
    dto: UpdateEnvironmentFlagConfigDto
  ): AuditSnapshot {
    const snapshot: AuditSnapshot = {};

    if (dto.enabled !== undefined) {
      snapshot.enabled = config.enabled;
    }

    if (dto.value !== undefined) {
      snapshot.value = config.value;
    }

    if (dto.rolloutPercentage !== undefined) {
      snapshot.rolloutPercentage = config.rolloutPercentage;
    }

    return snapshot;
  }

  private changedFeatureFlagSnapshot(
    featureFlag: FeatureFlag | FeatureFlagResponse,
    dto: UpdateFeatureFlagDto
  ): AuditSnapshot {
    const snapshot: AuditSnapshot = {};

    if (dto.name !== undefined) {
      snapshot.name = featureFlag.name;
    }

    if (dto.description !== undefined) {
      snapshot.description = featureFlag.description;
    }

    return snapshot;
  }

  private featureFlagSnapshot(featureFlag: FeatureFlag | FeatureFlagResponse): AuditSnapshot {
    return {
      description: featureFlag.description,
      key: featureFlag.key,
      name: featureFlag.name,
      projectId: featureFlag.projectId,
      type: featureFlag.type
    };
  }
}
