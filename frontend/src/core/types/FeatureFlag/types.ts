export type FeatureFlagType = "BOOLEAN";

export interface EnvironmentFlagConfig {
  createdAt: string;
  enabled: boolean;
  environmentId: string;
  environmentKey: string;
  environmentName: string;
  id: string;
  rolloutPercentage: number;
  updatedAt: string;
  value: boolean;
}

export interface FeatureFlag {
  createdAt: string;
  description: string | null;
  environmentConfigs: EnvironmentFlagConfig[];
  id: string;
  key: string;
  name: string;
  projectId: string;
  type: FeatureFlagType;
  updatedAt: string;
}

export interface CreateFeatureFlagInput {
  description?: string;
  name: string;
}

export interface UpdateFeatureFlagInput {
  description?: string | null;
  name?: string;
}

export interface UpdateEnvironmentFlagConfigInput {
  enabled?: boolean;
  rolloutPercentage?: number;
  value?: boolean;
}
