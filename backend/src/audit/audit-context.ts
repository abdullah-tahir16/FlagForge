import type { Request } from "express";
import type { AuditAction } from "./audit-action.enum";
import type { AuditResourceType } from "./audit-resource-type.enum";

export type AuditSnapshotValue = string | number | boolean | null | AuditSnapshot | AuditSnapshotValue[];

export interface AuditSnapshot {
  [key: string]: AuditSnapshotValue | undefined;
}

export interface AuditContext {
  ipAddress?: string | null;
}

export interface AuditRecordInput {
  action: AuditAction;
  environmentId?: string | null;
  newValue?: AuditSnapshot | null;
  oldValue?: AuditSnapshot | null;
  projectId?: string | null;
  resourceId: string;
  resourceName?: string | null;
  resourceType: AuditResourceType;
}

const sensitiveKeyPattern = /(password|hash|token|cookie|secret|authorization|credential|jwt)/i;

export const sanitizeAuditSnapshot = (value: AuditSnapshot | null | undefined): AuditSnapshot | null => {
  if (!value) {
    return null;
  }

  return Object.entries(value).reduce<AuditSnapshot>((snapshot, [key, nestedValue]) => {
    if (sensitiveKeyPattern.test(key)) {
      return snapshot;
    }

    if (Array.isArray(nestedValue)) {
      snapshot[key] = nestedValue.map((item) =>
        typeof item === "object" && item !== null ? sanitizeAuditSnapshot(item as AuditSnapshot) : item
      );
      return snapshot;
    }

    if (typeof nestedValue === "object" && nestedValue !== null) {
      snapshot[key] = sanitizeAuditSnapshot(nestedValue as AuditSnapshot);
      return snapshot;
    }

    snapshot[key] = nestedValue;
    return snapshot;
  }, {});
};

export const getAuditContextFromRequest = (request: Request): AuditContext => {
  const forwardedFor = request.headers["x-forwarded-for"];
  const forwardedIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor?.split(",")[0]?.trim();

  return {
    ipAddress: forwardedIp || request.ip || request.socket.remoteAddress || null
  };
};
