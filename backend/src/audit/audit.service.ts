import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import type { AuthenticatedUser } from "../auth/authenticated-user";
import type { AuditContext, AuditRecordInput } from "./audit-context";
import { sanitizeAuditSnapshot } from "./audit-context";
import { AuditLog } from "./audit-log.entity";
import type { AuditLogListResponse, AuditLogResponse } from "./dto/audit-log-response.dto";
import type { ListAuditLogsDto } from "./dto/list-audit-logs.dto";

const defaultLimit = 25;
const maxLimit = 100;

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogsRepository: Repository<AuditLog>
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
    const limit = Math.min(Math.max(filters.limit ?? defaultLimit, 1), maxLimit);
    const offset = this.parseCursor(filters.cursor);
    const query = this.auditLogsRepository
      .createQueryBuilder("auditLog")
      .where("auditLog.organization_id = :organizationId", { organizationId: user.organizationId })
      .orderBy("auditLog.created_at", "DESC")
      .addOrderBy("auditLog.id", "DESC")
      .skip(offset)
      .take(limit + 1);

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

    const auditLogs = await query.getMany();
    const entries = auditLogs.slice(0, limit);

    return {
      entries: entries.map((auditLog) => this.toResponse(auditLog)),
      nextCursor: auditLogs.length > limit ? String(offset + limit) : null
    };
  }

  private parseCursor(cursor: string | undefined): number {
    const parsedCursor = Number(cursor);

    return Number.isInteger(parsedCursor) && parsedCursor > 0 ? parsedCursor : 0;
  }

  private toResponse(auditLog: AuditLog): AuditLogResponse {
    return {
      action: auditLog.action,
      actorEmail: auditLog.actorEmail,
      actorUserId: auditLog.actorUserId,
      createdAt: auditLog.createdAt,
      environmentId: auditLog.environmentId,
      id: auditLog.id,
      ipAddress: auditLog.ipAddress,
      newValue: auditLog.newValue,
      oldValue: auditLog.oldValue,
      organizationId: auditLog.organizationId,
      projectId: auditLog.projectId,
      resourceId: auditLog.resourceId,
      resourceName: auditLog.resourceName,
      resourceType: auditLog.resourceType
    };
  }
}
