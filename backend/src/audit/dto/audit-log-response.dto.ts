import type { AuditSnapshot } from "../audit-context";
import type { AuditAction } from "../audit-action.enum";
import type { AuditResourceType } from "../audit-resource-type.enum";
import type { CursorPaginatedResponse } from "../../common/pagination/cursor-pagination";

export interface AuditLogResponse {
  action: AuditAction;
  actorEmail: string;
  actorUserId: string;
  createdAt: Date;
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

export type AuditLogListResponse = CursorPaginatedResponse<AuditLogResponse>;
