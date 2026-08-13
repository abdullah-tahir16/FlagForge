export interface SdkKeyResponse {
  createdAt: Date;
  environmentId: string;
  id: string;
  keyPrefix: string;
  lastUsedAt: Date | null;
  name: string;
  revokedAt: Date | null;
  updatedAt: Date;
}

export interface CreatedSdkKeyResponse extends SdkKeyResponse {
  key: string;
}
