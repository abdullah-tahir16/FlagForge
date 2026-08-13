export interface Environment {
  createdAt: string;
  id: string;
  key: string;
  name: string;
  projectId: string;
  sortOrder: number;
  updatedAt: string;
}

export interface UpdateEnvironmentInput {
  name?: string;
}
