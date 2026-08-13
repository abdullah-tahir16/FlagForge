import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IsNull, Repository } from "typeorm";
import type { AuditContext, AuditSnapshot } from "../audit/audit-context";
import { AuditAction } from "../audit/audit-action.enum";
import { AuditResourceType } from "../audit/audit-resource-type.enum";
import { AuditService } from "../audit/audit.service";
import { AuthenticatedUser } from "../auth/authenticated-user";
import { Environment } from "../environments/environment.entity";
import { ProjectsService } from "../projects/projects.service";
import { CreateSdkKeyDto } from "./dto/create-sdk-key.dto";
import { CreatedSdkKeyResponse, SdkKeyResponse } from "./dto/sdk-key-response.dto";
import { SdkKey } from "./sdk-key.entity";
import { SdkKeySecretService } from "./sdk-key-secret.service";

@Injectable()
export class SdkKeysService {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly sdkKeySecretService: SdkKeySecretService,
    private readonly auditService: AuditService,
    @InjectRepository(Environment)
    private readonly environmentsRepository: Repository<Environment>,
    @InjectRepository(SdkKey)
    private readonly sdkKeysRepository: Repository<SdkKey>
  ) {}

  async create(
    user: AuthenticatedUser,
    projectId: string,
    environmentId: string,
    dto: CreateSdkKeyDto,
    auditContext?: AuditContext
  ): Promise<CreatedSdkKeyResponse> {
    const environment = await this.findEnvironmentForUser(user, projectId, environmentId);
    const secret = this.sdkKeySecretService.generate(environment);
    const sdkKey = await this.sdkKeysRepository.save(
      this.sdkKeysRepository.create({
        environmentId,
        keyHash: this.sdkKeySecretService.hash(secret),
        keyPrefix: this.sdkKeySecretService.prefix(secret),
        lastUsedAt: null,
        name: dto.name.trim(),
        revokedAt: null
      })
    );
    await this.auditService.record(
      user,
      {
        action: AuditAction.SdkKeyCreated,
        environmentId,
        newValue: this.sdkKeySnapshot(sdkKey),
        oldValue: null,
        projectId,
        resourceId: sdkKey.id,
        resourceName: sdkKey.name,
        resourceType: AuditResourceType.SdkKey
      },
      auditContext
    );

    return {
      ...this.toResponse(sdkKey),
      key: secret
    };
  }

  async findAll(user: AuthenticatedUser, projectId: string, environmentId: string): Promise<SdkKeyResponse[]> {
    await this.findEnvironmentForUser(user, projectId, environmentId);
    const sdkKeys = await this.sdkKeysRepository.find({
      order: { createdAt: "DESC" },
      where: { environmentId }
    });

    return sdkKeys.map((sdkKey) => this.toResponse(sdkKey));
  }

  async revoke(
    user: AuthenticatedUser,
    projectId: string,
    environmentId: string,
    sdkKeyId: string,
    auditContext?: AuditContext
  ): Promise<void> {
    await this.findEnvironmentForUser(user, projectId, environmentId);
    const sdkKey = await this.sdkKeysRepository.findOne({ where: { environmentId, id: sdkKeyId } });

    if (!sdkKey) {
      throw new NotFoundException("SDK key was not found");
    }

    const oldValue = this.sdkKeySnapshot(sdkKey);

    if (!sdkKey.revokedAt) {
      sdkKey.revokedAt = new Date();
      await this.sdkKeysRepository.save(sdkKey);
    }

    await this.auditService.record(
      user,
      {
        action: AuditAction.SdkKeyRevoked,
        environmentId,
        newValue: this.sdkKeySnapshot(sdkKey),
        oldValue,
        projectId,
        resourceId: sdkKey.id,
        resourceName: sdkKey.name,
        resourceType: AuditResourceType.SdkKey
      },
      auditContext
    );
  }

  async findActiveBySecret(secret: string): Promise<SdkKey | null> {
    return this.sdkKeysRepository.findOne({
      relations: { environment: { project: true } },
      where: {
        keyHash: this.sdkKeySecretService.hash(secret),
        revokedAt: IsNull()
      }
    });
  }

  async markUsed(sdkKey: SdkKey): Promise<SdkKey> {
    sdkKey.lastUsedAt = new Date();
    return this.sdkKeysRepository.save(sdkKey);
  }

  private async findEnvironmentForUser(
    user: AuthenticatedUser,
    projectId: string,
    environmentId: string
  ): Promise<Environment> {
    await this.projectsService.findProjectForUser(user, projectId);
    const environment = await this.environmentsRepository.findOne({ where: { id: environmentId, projectId } });

    if (!environment) {
      throw new NotFoundException("Environment was not found");
    }

    return environment;
  }

  private toResponse(sdkKey: SdkKey): SdkKeyResponse {
    return {
      createdAt: sdkKey.createdAt,
      environmentId: sdkKey.environmentId,
      id: sdkKey.id,
      keyPrefix: sdkKey.keyPrefix,
      lastUsedAt: sdkKey.lastUsedAt,
      name: sdkKey.name,
      revokedAt: sdkKey.revokedAt,
      updatedAt: sdkKey.updatedAt
    };
  }

  private sdkKeySnapshot(sdkKey: SdkKey): AuditSnapshot {
    return {
      environmentId: sdkKey.environmentId,
      keyPrefix: sdkKey.keyPrefix,
      lastUsedAt: sdkKey.lastUsedAt?.toISOString() ?? null,
      name: sdkKey.name,
      revokedAt: sdkKey.revokedAt?.toISOString() ?? null
    };
  }
}
