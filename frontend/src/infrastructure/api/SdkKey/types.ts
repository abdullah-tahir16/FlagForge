import type { CreateSdkKeyInput, CreatedSdkKey, SdkKey } from "../../../core/types/SdkKey";

export type CreateSdkKeyRequestDto = CreateSdkKeyInput;

export interface SdkKeyResponseDto extends SdkKey {}

export interface CreatedSdkKeyResponseDto extends CreatedSdkKey {}
