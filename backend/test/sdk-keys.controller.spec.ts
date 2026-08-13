import { SdkKeysController } from "../src/sdk-keys/sdk-keys.controller";
import { SdkKeysService } from "../src/sdk-keys/sdk-keys.service";
import { UserRole } from "../src/users/user-role.enum";

describe("SdkKeysController", () => {
  const user = {
    email: "user@example.com",
    id: "user-1",
    organizationId: "org-1",
    role: UserRole.Owner
  };
  const response = {
    createdAt: new Date("2026-08-13T00:00:00.000Z"),
    environmentId: "environment-1",
    id: "sdk-key-1",
    keyPrefix: "ff_development_sk_abc",
    lastUsedAt: null,
    name: "Browser app",
    revokedAt: null,
    updatedAt: new Date("2026-08-13T00:00:00.000Z")
  };
  const request = {
    headers: {},
    ip: "127.0.0.1",
    socket: { remoteAddress: "127.0.0.2" }
  };

  const createController = () => {
    const service = {
      create: jest.fn(async () => ({ ...response, key: "ff_development_sk_secret" })),
      findAll: jest.fn(async () => [response]),
      revoke: jest.fn(async () => undefined)
    };
    const controller = new SdkKeysController(service as unknown as SdkKeysService);

    return { controller, service };
  };

  it("routes create/list/revoke calls to the SDK key service", async () => {
    const { controller, service } = createController();

    await expect(
      controller.create(user, "project-1", "environment-1", { name: "Browser app" }, request as never)
    ).resolves.toMatchObject({
      key: "ff_development_sk_secret"
    });
    await expect(controller.findAll(user, "project-1", "environment-1")).resolves.toEqual([response]);
    await expect(controller.revoke(user, "project-1", "environment-1", "sdk-key-1", request as never)).resolves.toBeUndefined();

    expect(service.create).toHaveBeenCalledWith(user, "project-1", "environment-1", { name: "Browser app" }, { ipAddress: "127.0.0.1" });
    expect(service.findAll).toHaveBeenCalledWith(user, "project-1", "environment-1");
    expect(service.revoke).toHaveBeenCalledWith(user, "project-1", "environment-1", "sdk-key-1", { ipAddress: "127.0.0.1" });
  });
});
