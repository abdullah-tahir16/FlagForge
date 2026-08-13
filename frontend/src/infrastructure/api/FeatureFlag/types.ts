import type {
  CreateFeatureFlagInput,
  FeatureFlag,
  UpdateEnvironmentFlagConfigInput,
  UpdateFeatureFlagInput
} from "../../../core/types/FeatureFlag";

export type CreateFeatureFlagRequestDto = CreateFeatureFlagInput;
export type FeatureFlagResponseDto = FeatureFlag;
export type UpdateEnvironmentFlagConfigRequestDto = UpdateEnvironmentFlagConfigInput;
export type UpdateFeatureFlagRequestDto = UpdateFeatureFlagInput;
