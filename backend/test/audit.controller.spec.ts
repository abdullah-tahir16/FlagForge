import { GUARDS_METADATA } from "@nestjs/common/constants";
import { AuditController } from "../src/audit/audit.controller";
import { AuditAction } from "../src/audit/audit-action.enum";
import { AuditResourceType } from "../src/audit/audit-resource-type.enum";
import { AuditService } from "../src/audit/audit.service";
import { JwtAuthGuard } from "../src/auth/jwt-auth.guard";
import { UserRole } from "../src/users/user-role.enum";

describe("AuditController", () => {
  const user = {
    email: "user@example.com",
    id: "user-1",
    organizationId: "org-1",
    role: UserRole.Owner
  };
  const response = {
    entries: [
      {
        action: AuditAction.ProjectCreated,
        actorEmail: "user@example.com",
        actorUserId: "user-1",
        createdAt: new Date("2026-08-13T00:00:00.000Z"),
        environmentId: null,
        environmentName: null,
        id: "audit-1",
        ipAddress: "127.0.0.1",
        newValue: { name: "Checkout" },
        oldValue: null,
        organizationId: "org-1",
        projectId: "project-1",
        projectName: "Checkout",
        resourceId: "project-1",
        resourceName: "Checkout",
        resourceType: AuditResourceType.Project
      }
    ],
    pagination: {
      hasNextPage: false,
      limit: 25,
      nextCursor: null
    }
  };

  const createController = () => {
    const service = {
      findAll: jest.fn(async () => response)
    };
    const controller = new AuditController(service as unknown as AuditService);

    return { controller, service };
  };

  it("uses the JWT auth guard", () => {
    const guards = Reflect.getMetadata(GUARDS_METADATA, AuditController);

    expect(guards).toContain(JwtAuthGuard);
  });

  it("forwards authenticated list filters to the audit service", async () => {
    const { controller, service } = createController();
    const filters = {
      action: AuditAction.ProjectCreated,
      limit: 10,
      projectId: "project-1",
      resourceType: AuditResourceType.Project
    };

    await expect(controller.findAll(user, filters)).resolves.toEqual(response);
    expect(service.findAll).toHaveBeenCalledWith(user, filters);
  });
});
