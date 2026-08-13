import { FeatureFlagType } from "../feature-flag-type.enum";

export interface EnvironmentFlagConfigResponse {
  createdAt: Date;
  enabled: boolean;
  environmentId: string;
  environmentKey: string;
  environmentName: string;
  id: string;
  updatedAt: Date;
  value: boolean;
}

export interface FeatureFlagResponse {
  createdAt: Date;
  description: string | null;
  environmentConfigs: EnvironmentFlagConfigResponse[];
  id: string;
  key: string;
  name: string;
  projectId: string;
  type: FeatureFlagType;
  updatedAt: Date;
}
