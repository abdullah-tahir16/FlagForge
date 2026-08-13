import type { FeatureFlagType } from "../../feature-flags/feature-flag-type.enum";
import type { SegmentMatchMode } from "../../segments/segment-match-mode.enum";
import type { TargetingComparisonValue } from "../../targeting-rules/targeting-rule-comparison-value";
import type { TargetingRuleOperator } from "../../targeting-rules/targeting-rule-operator.enum";
import type { TargetingRuleSource } from "../../targeting-rules/targeting-rule-source.enum";
import { EVALUATION_CACHE_SCHEMA_VERSION } from "./evaluation-cache-keys";

export interface CachedEvaluationEnvironment {
  id: string;
  key: string;
  name: string;
  projectId: string;
}

export interface CachedEvaluationSegmentCondition {
  attribute: string;
  comparisonValue: TargetingComparisonValue;
  id: string;
  operator: TargetingRuleOperator;
  sortOrder: number;
}

export interface CachedEvaluationSegment {
  conditions: CachedEvaluationSegmentCondition[];
  id: string;
  key: string;
  matchMode: SegmentMatchMode;
  name: string;
}

export interface CachedEvaluationTargetingRule {
  attribute: string | null;
  comparisonValue: TargetingComparisonValue | null;
  id: string;
  operator: TargetingRuleOperator | null;
  resultValue: boolean;
  segment: CachedEvaluationSegment | null;
  segmentId: string | null;
  sortOrder: number;
  source: TargetingRuleSource;
}

export interface CachedEvaluationFlagConfig {
  enabled: boolean;
  environmentId: string;
  featureFlagId: string;
  id: string;
  rolloutPercentage: number;
  value: boolean;
}

export interface CachedEvaluationFlag {
  config: CachedEvaluationFlagConfig | null;
  id: string;
  key: string;
  name: string;
  targetingRules: CachedEvaluationTargetingRule[];
  type: FeatureFlagType;
}

export interface CachedEnvironmentEvaluationSnapshot {
  environment: CachedEvaluationEnvironment;
  flags: CachedEvaluationFlag[];
  projectId: string;
  schemaVersion: typeof EVALUATION_CACHE_SCHEMA_VERSION;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const hasString = (value: Record<string, unknown>, key: string): boolean => typeof value[key] === "string";

const hasBoolean = (value: Record<string, unknown>, key: string): boolean => typeof value[key] === "boolean";

const hasNumber = (value: Record<string, unknown>, key: string): boolean => typeof value[key] === "number";

const isEnvironment = (value: unknown): value is CachedEvaluationEnvironment =>
  isRecord(value) && hasString(value, "id") && hasString(value, "key") && hasString(value, "name") && hasString(value, "projectId");

const isConfig = (value: unknown): value is CachedEvaluationFlagConfig =>
  isRecord(value) &&
  hasBoolean(value, "enabled") &&
  hasString(value, "environmentId") &&
  hasString(value, "featureFlagId") &&
  hasString(value, "id") &&
  hasNumber(value, "rolloutPercentage") &&
  hasBoolean(value, "value");

const isSegmentCondition = (value: unknown): value is CachedEvaluationSegmentCondition =>
  isRecord(value) &&
  hasString(value, "attribute") &&
  hasString(value, "id") &&
  hasString(value, "operator") &&
  hasNumber(value, "sortOrder") &&
  "comparisonValue" in value;

const isSegment = (value: unknown): value is CachedEvaluationSegment =>
  isRecord(value) &&
  Array.isArray(value.conditions) &&
  value.conditions.every(isSegmentCondition) &&
  hasString(value, "id") &&
  hasString(value, "key") &&
  hasString(value, "matchMode") &&
  hasString(value, "name");

const isTargetingRule = (value: unknown): value is CachedEvaluationTargetingRule =>
  isRecord(value) &&
  (typeof value.attribute === "string" || value.attribute === null) &&
  "comparisonValue" in value &&
  hasString(value, "id") &&
  (typeof value.operator === "string" || value.operator === null) &&
  hasBoolean(value, "resultValue") &&
  (isSegment(value.segment) || value.segment === null) &&
  (typeof value.segmentId === "string" || value.segmentId === null) &&
  hasNumber(value, "sortOrder") &&
  hasString(value, "source");

const isFlag = (value: unknown): value is CachedEvaluationFlag =>
  isRecord(value) &&
  (isConfig(value.config) || value.config === null) &&
  hasString(value, "id") &&
  hasString(value, "key") &&
  hasString(value, "name") &&
  Array.isArray(value.targetingRules) &&
  value.targetingRules.every(isTargetingRule) &&
  hasString(value, "type");

export const parseCachedEnvironmentEvaluationSnapshot = (
  rawValue: string
): CachedEnvironmentEvaluationSnapshot | null => {
  try {
    const parsed: unknown = JSON.parse(rawValue);

    if (
      !isRecord(parsed) ||
      parsed.schemaVersion !== EVALUATION_CACHE_SCHEMA_VERSION ||
      !hasString(parsed, "projectId") ||
      !isEnvironment(parsed.environment) ||
      !Array.isArray(parsed.flags) ||
      !parsed.flags.every(isFlag)
    ) {
      return null;
    }

    return parsed as unknown as CachedEnvironmentEvaluationSnapshot;
  } catch {
    return null;
  }
};
