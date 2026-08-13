import { RealtimeEventAction } from "./realtime-event-action.enum";
import { RealtimeResourceType } from "./realtime-resource-type.enum";

export enum RealtimeEventType {
  ConfigurationChanged = "CONFIGURATION_CHANGED"
}

export interface RealtimeConfigurationEvent {
  action: RealtimeEventAction;
  environmentIds: string[];
  id: string;
  occurredAt: string;
  organizationId: string;
  projectId: string;
  resourceId: string;
  resourceType: RealtimeResourceType;
  type: RealtimeEventType.ConfigurationChanged;
}

export type RealtimeEvent = RealtimeConfigurationEvent;

export interface PublishConfigurationChangedInput {
  action: RealtimeEventAction;
  environmentIds?: string[];
  organizationId: string;
  projectId: string;
  resourceId: string;
  resourceType: RealtimeResourceType;
}
