import { z } from "zod";
import { auditActions, auditResourceTypes } from "../../../core/types/Audit";
import type { AuditAction, AuditResourceType } from "../../../core/types/Audit";

type BadgeTone = "danger" | "info" | "neutral" | "primary" | "success" | "warning";

export const auditFilterSchema = z.object({
  action: z.union([z.literal(""), z.enum(auditActions)]),
  projectId: z.string().trim(),
  resourceType: z.union([z.literal(""), z.enum(auditResourceTypes)])
});

export const auditActionLabels: Record<AuditAction, string> = {
  ENVIRONMENT_UPDATED: "Environment updated",
  FEATURE_FLAG_CONFIG_UPDATED: "Flag config updated",
  FEATURE_FLAG_CREATED: "Flag created",
  FEATURE_FLAG_DELETED: "Flag deleted",
  FEATURE_FLAG_UPDATED: "Flag updated",
  PROJECT_CREATED: "Project created",
  PROJECT_DELETED: "Project deleted",
  PROJECT_UPDATED: "Project updated",
  SDK_KEY_CREATED: "SDK key created",
  SDK_KEY_REVOKED: "SDK key revoked"
};

export const auditResourceLabels: Record<AuditResourceType, string> = {
  ENVIRONMENT: "Environment",
  ENVIRONMENT_FLAG_CONFIG: "Flag config",
  FEATURE_FLAG: "Feature flag",
  PROJECT: "Project",
  SDK_KEY: "SDK key"
};

export const auditActionTone = (action: AuditAction): BadgeTone => {
  if (action.endsWith("_DELETED") || action.endsWith("_REVOKED")) {
    return "danger";
  }

  if (action.endsWith("_CREATED")) {
    return "success";
  }

  return action === "FEATURE_FLAG_CONFIG_UPDATED" ? "primary" : "info";
};
