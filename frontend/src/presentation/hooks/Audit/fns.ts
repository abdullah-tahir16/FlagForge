import type { AuditAction, AuditLog, AuditLogFilters, AuditResourceType, AuditSnapshot } from "../../../core/types/Audit";
import { auditActionLabels, auditResourceLabels } from "./data";

export const getAuditFilterValues = (filters: {
  action?: string;
  projectId?: string;
  resourceType?: string;
}) => ({
  action: filters.action ?? "",
  projectId: filters.projectId ?? "",
  resourceType: filters.resourceType ?? ""
});

export const toAuditFilters = (values: {
  action?: string;
  projectId?: string;
  resourceType?: string;
}): AuditLogFilters => ({
  action: (values.action || undefined) as AuditAction | undefined,
  projectId: values.projectId?.trim() || undefined,
  resourceType: (values.resourceType || undefined) as AuditResourceType | undefined
});

export const formatAuditTime = (value: string): string =>
  new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));

export const formatSnapshot = (snapshot: AuditSnapshot | null): string => {
  if (!snapshot || Object.keys(snapshot).length === 0) {
    return "No fields";
  }

  return Object.entries(snapshot)
    .map(([key, value]) => `${key}: ${formatSnapshotValue(value)}`)
    .join(", ");
};

export const getAuditRowTitle = (auditLog: AuditLog): string =>
  `${auditActionLabels[auditLog.action]} on ${auditLog.resourceName ?? auditLog.resourceId}`;

export const getAuditRowSubtitle = (auditLog: AuditLog): string =>
  `${auditResourceLabels[auditLog.resourceType]} by ${auditLog.actorEmail}`;

const formatSnapshotValue = (value: unknown): string => {
  if (value === null || value === undefined) {
    return "null";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
};
