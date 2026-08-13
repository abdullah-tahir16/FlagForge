import type { AuditAction, AuditResourceType, AuditSnapshot } from "../../../core/types/Audit";
import type { CursorPaginationMetadata, CursorPaginationParams } from "../../../core/types/Pagination";

export interface AuditLogResponseDto {
  action: AuditAction;
  actorEmail: string;
  actorUserId: string;
  createdAt: string;
  environmentId: string | null;
  environmentName: string | null;
  id: string;
  ipAddress: string | null;
  newValue: AuditSnapshot | null;
  oldValue: AuditSnapshot | null;
  organizationId: string;
  projectId: string | null;
  projectName: string | null;
  resourceId: string;
  resourceName: string | null;
  resourceType: AuditResourceType;
}

export interface AuditLogListResponseDto {
  entries: AuditLogResponseDto[];
  pagination: CursorPaginationMetadata;
}

export interface AuditLogFiltersRequestDto extends CursorPaginationParams {
  action?: AuditAction;
  environmentId?: string;
  projectId?: string;
  resourceType?: AuditResourceType;
}
