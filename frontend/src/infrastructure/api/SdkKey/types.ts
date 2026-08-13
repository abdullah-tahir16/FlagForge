export interface SdkKeyResponseDto {
  createdAt: string;
  environmentId: string;
  id: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  name: string;
  revokedAt: string | null;
  updatedAt: string;
}

export interface CreatedSdkKeyResponseDto extends SdkKeyResponseDto {
  key: string;
}

export interface CreateSdkKeyRequestDto {
  name: string;
}
