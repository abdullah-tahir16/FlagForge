import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { OrganizationsService } from "../src/organizations/organizations.service";
import { Organization } from "../src/organizations/organization.entity";
import { UserRole } from "../src/users/user-role.enum";

describe("OrganizationsService", () => {
  const organization = {
    id: "org-1",
    name: "Acme",
    key: "acme",
    createdAt: new Date("2026-08-12T00:00:00.000Z"),
    updatedAt: new Date("2026-08-12T00:00:00.000Z")
  } as Organization;

  const owner = {
    id: "user-1",
    email: "owner@example.com",
    role: UserRole.Owner,
    organizationId: "org-1"
  };

  it("returns current organization without users", async () => {
    const repository = {
      findOne: jest.fn(async () => organization),
      save: jest.fn()
    };
    const service = new OrganizationsService(repository as never);

    const result = await service.getCurrentOrganization(owner);

    expect(result).toEqual({
      id: "org-1",
      name: "Acme",
      key: "acme",
      createdAt: organization.createdAt,
      updatedAt: organization.updatedAt
    });
    expect(result).not.toHaveProperty("users");
  });

  it("allows owners to update organization name while preserving key", async () => {
    const repository = {
      findOne: jest.fn(async () => ({ ...organization })),
      save: jest.fn(async (value: Organization) => value)
    };
    const service = new OrganizationsService(repository as never);

    const result = await service.updateCurrentOrganization(owner, { name: "Acme Updated" });

    expect(result.name).toBe("Acme Updated");
    expect(result.key).toBe("acme");
  });

  it("rejects non-owner updates and missing organizations", async () => {
    const repository = {
      findOne: jest.fn(async () => null),
      save: jest.fn()
    };
    const service = new OrganizationsService(repository as never);

    await expect(
      service.updateCurrentOrganization({ ...owner, role: UserRole.Developer }, { name: "New" })
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(service.getCurrentOrganization(owner)).rejects.toBeInstanceOf(NotFoundException);
  });
});
