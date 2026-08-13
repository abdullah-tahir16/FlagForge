export type RealtimeEventAction = "CREATED" | "DELETED" | "REORDERED" | "UPDATED";

export type RealtimeResourceType =
  | "ENVIRONMENT_FLAG_CONFIG"
  | "FEATURE_FLAG"
  | "SEGMENT"
  | "SEGMENT_CONDITION"
  | "TARGETING_RULE";

export interface RealtimeConfigurationEvent {
  action: RealtimeEventAction;
  environmentIds: string[];
  id: string;
  occurredAt: string;
  organizationId: string;
  projectId: string;
  resourceId: string;
  resourceType: RealtimeResourceType;
  type: "CONFIGURATION_CHANGED";
}

export type RealtimeEvent = RealtimeConfigurationEvent;
