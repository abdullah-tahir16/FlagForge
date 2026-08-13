export interface Project {
  createdAt: string;
  description: string | null;
  id: string;
  key: string;
  name: string;
  organizationId: string;
  updatedAt: string;
}

export interface CreateProjectInput {
  description?: string;
  name: string;
}

export interface UpdateProjectInput {
  description?: string | null;
  name?: string;
}
