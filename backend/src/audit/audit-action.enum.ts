export enum AuditAction {
  ProjectCreated = "PROJECT_CREATED",
  ProjectUpdated = "PROJECT_UPDATED",
  ProjectDeleted = "PROJECT_DELETED",
  EnvironmentUpdated = "ENVIRONMENT_UPDATED",
  FeatureFlagCreated = "FEATURE_FLAG_CREATED",
  FeatureFlagUpdated = "FEATURE_FLAG_UPDATED",
  FeatureFlagDeleted = "FEATURE_FLAG_DELETED",
  FeatureFlagConfigUpdated = "FEATURE_FLAG_CONFIG_UPDATED",
  SdkKeyCreated = "SDK_KEY_CREATED",
  SdkKeyRevoked = "SDK_KEY_REVOKED",
  TargetingRuleCreated = "TARGETING_RULE_CREATED",
  TargetingRuleUpdated = "TARGETING_RULE_UPDATED",
  TargetingRuleDeleted = "TARGETING_RULE_DELETED",
  TargetingRuleReordered = "TARGETING_RULE_REORDERED"
}
