import type { CursorPaginatedList, CursorPaginationParams } from "../Pagination";

export const auditActions = [
  "PROJECT_CREATED",
  "PROJECT_UPDATED",
  "PROJECT_DELETED",
  "ENVIRONMENT_UPDATED",
  "FEATURE_FLAG_CREATED",
  "FEATURE_FLAG_UPDATED",
  "FEATURE_FLAG_DELETED",
  "FEATURE_FLAG_CONFIG_UPDATED",
  "SDK_KEY_CREATED",
  "SDK_KEY_REVOKED",
  "TARGETING_RULE_CREATED",
  "TARGETING_RULE_UPDATED",
  "TARGETING_RULE_DELETED",
  "TARGETING_RULE_REORDERED"
] as const;

export const auditResourceTypes = [
  "PROJECT",
  "ENVIRONMENT",
  "FEATURE_FLAG",
  "ENVIRONMENT_FLAG_CONFIG",
  "SDK_KEY",
  "TARGETING_RULE"
] as const;

export type AuditAction = (typeof auditActions)[number];
export type AuditResourceType = (typeof auditResourceTypes)[number];
export type AuditSnapshot = Record<string, unknown>;

export interface AuditLog {
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

export interface AuditLogFilters extends CursorPaginationParams {
  action?: AuditAction;
  environmentId?: string;
  projectId?: string;
  resourceType?: AuditResourceType;
}

export type AuditLogList = CursorPaginatedList<AuditLog>;
