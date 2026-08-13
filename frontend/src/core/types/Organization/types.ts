export interface Organization {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOrganizationInput {
  name: string;
}
