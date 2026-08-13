import { z } from "zod";
import { auditActions, auditResourceTypes } from "../../../core/types/Audit";
import type { AuditAction, AuditResourceType } from "../../../core/types/Audit";

type BadgeTone = "danger" | "info" | "neutral" | "primary" | "success" | "warning";

const optionalSelectValue = <T extends readonly [string, ...string[]]>(values: T) =>
  z.preprocess((value) => (value === undefined || value === null ? "" : value), z.union([z.literal(""), z.enum(values)]));

export const auditFilterSchema = z.object({
  action: optionalSelectValue(auditActions),
  projectId: z.preprocess((value) => (value === undefined || value === null ? "" : value), z.string().trim()),
  resourceType: optionalSelectValue(auditResourceTypes)
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
  SDK_KEY_REVOKED: "SDK key revoked",
  SEGMENT_CONDITION_CREATED: "Segment condition created",
  SEGMENT_CONDITION_DELETED: "Segment condition deleted",
  SEGMENT_CONDITION_REORDERED: "Segment conditions reordered",
  SEGMENT_CONDITION_UPDATED: "Segment condition updated",
  SEGMENT_CREATED: "Segment created",
  SEGMENT_DELETED: "Segment deleted",
  SEGMENT_UPDATED: "Segment updated",
  TARGETING_RULE_CREATED: "Targeting rule created",
  TARGETING_RULE_DELETED: "Targeting rule deleted",
  TARGETING_RULE_REORDERED: "Targeting rules reordered",
  TARGETING_RULE_UPDATED: "Targeting rule updated"
};

export const auditResourceLabels: Record<AuditResourceType, string> = {
  ENVIRONMENT: "Environment",
  ENVIRONMENT_FLAG_CONFIG: "Flag config",
  FEATURE_FLAG: "Feature flag",
  PROJECT: "Project",
  SDK_KEY: "SDK key",
  SEGMENT: "Segment",
  SEGMENT_CONDITION: "Segment condition",
  TARGETING_RULE: "Targeting rule"
};

export const auditActionTone = (action: AuditAction): BadgeTone => {
  if (action.endsWith("_DELETED") || action.endsWith("_REVOKED")) {
    return "danger";
  }

  if (action.endsWith("_CREATED")) {
    return "success";
  }

  return action === "FEATURE_FLAG_CONFIG_UPDATED" || action.startsWith("TARGETING_RULE_") || action.startsWith("SEGMENT_")
    ? "primary"
    : "info";
};
