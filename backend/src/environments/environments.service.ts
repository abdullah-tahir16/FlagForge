import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type { AuditContext, AuditSnapshot } from "../audit/audit-context";
import { AuditAction } from "../audit/audit-action.enum";
import { AuditResourceType } from "../audit/audit-resource-type.enum";
import { AuditService } from "../audit/audit.service";
import { AuthenticatedUser } from "../auth/authenticated-user";
import { ProjectsService } from "../projects/projects.service";
import { EnvironmentResponse } from "./dto/environment-response.dto";
import { UpdateEnvironmentDto } from "./dto/update-environment.dto";
import { Environment } from "./environment.entity";

@Injectable()
export class EnvironmentsService {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly auditService: AuditService,
    @InjectRepository(Environment)
    private readonly environmentsRepository: Repository<Environment>
  ) {}

  async findAll(user: AuthenticatedUser, projectId: string): Promise<EnvironmentResponse[]> {
    await this.projectsService.findProjectForUser(user, projectId);
    const environments = await this.environmentsRepository.find({
      where: { projectId },
      order: { sortOrder: "ASC" }
    });

    return environments.map((environment) => this.toResponse(environment));
  }

  async update(
    user: AuthenticatedUser,
    projectId: string,
    environmentId: string,
    dto: UpdateEnvironmentDto,
    auditContext?: AuditContext
  ): Promise<EnvironmentResponse> {
    await this.projectsService.findProjectForUser(user, projectId);
    const environment = await this.environmentsRepository.findOne({ where: { id: environmentId, projectId } });

    if (!environment) {
      throw new NotFoundException("Environment was not found");
    }

    const oldValue = this.changedEnvironmentSnapshot(environment, dto);

    if (dto.name !== undefined) {
      environment.name = dto.name.trim();
    }

    const savedEnvironment = await this.environmentsRepository.save(environment);
    await this.auditService.record(
      user,
      {
        action: AuditAction.EnvironmentUpdated,
        environmentId: savedEnvironment.id,
        newValue: this.changedEnvironmentSnapshot(savedEnvironment, dto),
        oldValue,
        projectId,
        resourceId: savedEnvironment.id,
        resourceName: savedEnvironment.name,
        resourceType: AuditResourceType.Environment
      },
      auditContext
    );

    return this.toResponse(savedEnvironment);
  }

  toResponse(environment: Environment): EnvironmentResponse {
    return {
      createdAt: environment.createdAt,
      id: environment.id,
      key: environment.key,
      name: environment.name,
      projectId: environment.projectId,
      sortOrder: environment.sortOrder,
      updatedAt: environment.updatedAt
    };
  }

  private changedEnvironmentSnapshot(environment: Environment, dto: UpdateEnvironmentDto): AuditSnapshot {
    const snapshot: AuditSnapshot = {};

    if (dto.name !== undefined) {
      snapshot.name = environment.name;
    }

    return snapshot;
  }
}
