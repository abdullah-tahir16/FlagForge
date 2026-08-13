import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import type { AuthenticatedUser } from "../auth/authenticated-user";
import {
  applyCreatedAtCursorPagination,
  createCursorPaginatedResponse,
  resolveCursorPaginationLimit
} from "../common/pagination/cursor-pagination";
import { Environment } from "../environments/environment.entity";
import { Project } from "../projects/project.entity";
import type { AuditContext, AuditRecordInput } from "./audit-context";
import { sanitizeAuditSnapshot } from "./audit-context";
import { AuditLog } from "./audit-log.entity";
import type { AuditLogListResponse, AuditLogResponse } from "./dto/audit-log-response.dto";
import type { ListAuditLogsDto } from "./dto/list-audit-logs.dto";

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogsRepository: Repository<AuditLog>,
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(Environment)
    private readonly environmentsRepository: Repository<Environment>
  ) {}

  async record(user: AuthenticatedUser, input: AuditRecordInput, context: AuditContext = {}): Promise<AuditLogResponse> {
    const auditLog = await this.auditLogsRepository.save(
      this.auditLogsRepository.create({
        action: input.action,
        actorEmail: user.email,
        actorUserId: user.id,
        environmentId: input.environmentId ?? null,
        ipAddress: context.ipAddress ?? null,
        newValue: sanitizeAuditSnapshot(input.newValue),
        oldValue: sanitizeAuditSnapshot(input.oldValue),
        organizationId: user.organizationId,
        projectId: input.projectId ?? null,
        resourceId: input.resourceId,
        resourceName: input.resourceName ?? null,
        resourceType: input.resourceType
      })
    );

    return this.toResponse(auditLog);
  }

  async findAll(user: AuthenticatedUser, filters: ListAuditLogsDto = {}): Promise<AuditLogListResponse> {
    const limit = resolveCursorPaginationLimit(filters.limit);
    const query = this.auditLogsRepository
      .createQueryBuilder("auditLog")
      .where("auditLog.organization_id = :organizationId", { organizationId: user.organizationId });

    if (filters.projectId) {
      query.andWhere("auditLog.project_id = :projectId", { projectId: filters.projectId });
    }

    if (filters.environmentId) {
      query.andWhere("auditLog.environment_id = :environmentId", { environmentId: filters.environmentId });
    }

    if (filters.resourceType) {
      query.andWhere("auditLog.resource_type = :resourceType", { resourceType: filters.resourceType });
    }

    if (filters.action) {
      query.andWhere("auditLog.action = :action", { action: filters.action });
    }

    const auditLogs = await applyCreatedAtCursorPagination(query, {
      alias: "auditLog",
      cursor: filters.cursor,
      limit
    }).getMany();

    const { environmentNames, projectNames } = await this.resolveResourceNames(auditLogs);

    return createCursorPaginatedResponse(auditLogs, {
      limit,
      toEntry: (auditLog) =>
        this.toResponse(auditLog, {
          environmentName: auditLog.environmentId ? environmentNames.get(auditLog.environmentId) ?? null : null,
          projectName: auditLog.projectId ? projectNames.get(auditLog.projectId) ?? null : null
        })
    });
  }

  private async resolveResourceNames(
    auditLogs: AuditLog[]
  ): Promise<{ environmentNames: Map<string, string>; projectNames: Map<string, string> }> {
    const projectIds = [...new Set(auditLogs.map((auditLog) => auditLog.projectId).filter((id): id is string => Boolean(id)))];
    const environmentIds = [
      ...new Set(auditLogs.map((auditLog) => auditLog.environmentId).filter((id): id is string => Boolean(id)))
    ];

    const [projects, environments] = await Promise.all([
      projectIds.length > 0 ? this.projectsRepository.find({ where: { id: In(projectIds) } }) : Promise.resolve([]),
      environmentIds.length > 0 ? this.environmentsRepository.find({ where: { id: In(environmentIds) } }) : Promise.resolve([])
    ]);

    return {
      environmentNames: new Map(environments.map((environment) => [environment.id, environment.name])),
      projectNames: new Map(projects.map((project) => [project.id, project.name]))
    };
  }

  private toResponse(
    auditLog: AuditLog,
    resolvedNames: { environmentName: string | null; projectName: string | null } = { environmentName: null, projectName: null }
  ): AuditLogResponse {
    return {
      action: auditLog.action,
      actorEmail: auditLog.actorEmail,
      actorUserId: auditLog.actorUserId,
      createdAt: auditLog.createdAt,
      environmentId: auditLog.environmentId,
      environmentName: resolvedNames.environmentName,
      id: auditLog.id,
      ipAddress: auditLog.ipAddress,
      newValue: auditLog.newValue,
      oldValue: auditLog.oldValue,
      organizationId: auditLog.organizationId,
      projectId: auditLog.projectId,
      projectName: resolvedNames.projectName,
      resourceId: auditLog.resourceId,
      resourceName: auditLog.resourceName,
      resourceType: auditLog.resourceType
    };
  }
}
