export interface SdkKey {
  createdAt: string;
  environmentId: string;
  id: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  name: string;
  revokedAt: string | null;
  updatedAt: string;
}

export interface CreatedSdkKey extends SdkKey {
  key: string;
}

export interface CreateSdkKeyInput {
  name: string;
}
