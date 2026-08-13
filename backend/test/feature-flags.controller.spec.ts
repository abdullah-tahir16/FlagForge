import { FeatureFlagsController } from "../src/feature-flags/feature-flags.controller";
import { FeatureFlagType } from "../src/feature-flags/feature-flag-type.enum";
import { FeatureFlagsService } from "../src/feature-flags/feature-flags.service";
import { UserRole } from "../src/users/user-role.enum";

describe("FeatureFlagsController", () => {
  const user = {
    email: "user@example.com",
    id: "user-1",
    organizationId: "org-1",
    role: UserRole.Owner
  };
  const response = {
    createdAt: new Date("2026-08-13T00:00:00.000Z"),
    description: null,
    environmentConfigs: [],
    id: "flag-1",
    key: "new-checkout",
    name: "New Checkout",
    projectId: "project-1",
    type: FeatureFlagType.Boolean,
    updatedAt: new Date("2026-08-13T00:00:00.000Z")
  };
  const request = {
    headers: { "x-forwarded-for": "203.0.113.9, 198.51.100.1" },
    ip: "127.0.0.1",
    socket: { remoteAddress: "127.0.0.1" }
  };

  const createController = () => {
    const service = {
      create: jest.fn(async () => response),
      findAll: jest.fn(async () => [response]),
      findOne: jest.fn(async () => response),
      remove: jest.fn(async () => undefined),
      update: jest.fn(async () => response),
      updateEnvironmentConfig: jest.fn(async () => response)
    };
    const controller = new FeatureFlagsController(service as unknown as FeatureFlagsService);

    return { controller, service };
  };

  it("routes create/list/detail/update/delete calls to the feature flag service", async () => {
    const { controller, service } = createController();

    await expect(controller.create(user, "project-1", { name: "New Checkout" }, request as never)).resolves.toEqual(response);
    await expect(controller.findAll(user, "project-1")).resolves.toEqual([response]);
    await expect(controller.findOne(user, "project-1", "flag-1")).resolves.toEqual(response);
    await expect(controller.update(user, "project-1", "flag-1", { name: "Checkout" }, request as never)).resolves.toEqual(response);
    await expect(controller.remove(user, "project-1", "flag-1", request as never)).resolves.toBeUndefined();

    expect(service.create).toHaveBeenCalledWith(user, "project-1", { name: "New Checkout" }, { ipAddress: "203.0.113.9" });
    expect(service.findAll).toHaveBeenCalledWith(user, "project-1");
    expect(service.findOne).toHaveBeenCalledWith(user, "project-1", "flag-1");
    expect(service.update).toHaveBeenCalledWith(user, "project-1", "flag-1", { name: "Checkout" }, { ipAddress: "203.0.113.9" });
    expect(service.remove).toHaveBeenCalledWith(user, "project-1", "flag-1", { ipAddress: "203.0.113.9" });
  });

  it("routes environment config updates to the service", async () => {
    const { controller, service } = createController();

    await expect(
      controller.updateEnvironmentConfig(
        user,
        "project-1",
        "flag-1",
        "environment-1",
        { enabled: true, value: false },
        request as never
      )
    ).resolves.toEqual(response);

    expect(service.updateEnvironmentConfig).toHaveBeenLastCalledWith(
      user,
      "project-1",
      "flag-1",
      "environment-1",
      {
        enabled: true,
        value: false
      },
      { ipAddress: "203.0.113.9" }
    );
  });
});
