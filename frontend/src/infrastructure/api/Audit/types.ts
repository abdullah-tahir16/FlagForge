import type { AuditAction, AuditResourceType, AuditSnapshot } from "../../../core/types/Audit";

export interface AuditLogResponseDto {
  action: AuditAction;
  actorEmail: string;
  actorUserId: string;
  createdAt: string;
  environmentId: string | null;
  id: string;
  ipAddress: string | null;
  newValue: AuditSnapshot | null;
  oldValue: AuditSnapshot | null;
  organizationId: string;
  projectId: string | null;
  resourceId: string;
  resourceName: string | null;
  resourceType: AuditResourceType;
}

export interface AuditLogListResponseDto {
  entries: AuditLogResponseDto[];
  nextCursor: string | null;
}

export interface AuditLogFiltersRequestDto {
  action?: AuditAction;
  cursor?: string;
  environmentId?: string;
  limit?: number;
  projectId?: string;
  resourceType?: AuditResourceType;
}
