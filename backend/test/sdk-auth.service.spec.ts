import { UnauthorizedException } from "@nestjs/common";
import { Environment } from "../src/environments/environment.entity";
import { SdkKey } from "../src/sdk-keys/sdk-key.entity";
import { SdkKeysService } from "../src/sdk-keys/sdk-keys.service";
import { SdkAuthService } from "../src/evaluations/sdk-auth.service";

const createEnvironment = (): Environment =>
  ({
    id: "environment-1",
    key: "development",
    name: "Development",
    project: { id: "project-1", organizationId: "org-1" },
    projectId: "project-1"
  }) as Environment;

describe("SdkAuthService", () => {
  const createService = () => {
    const sdkKey = {
      environment: createEnvironment(),
      environmentId: "environment-1",
      id: "sdk-key-1",
      revokedAt: null
    } as SdkKey;
    const sdkKeysService = {
      findActiveBySecret: jest.fn(async (secret: string) => (secret === "valid-secret" ? sdkKey : null)),
      markUsed: jest.fn(async (value: SdkKey) => ({ ...value, lastUsedAt: new Date("2026-08-13T00:00:00.000Z") }))
    };
    const service = new SdkAuthService(sdkKeysService as unknown as SdkKeysService);

    return { sdkKey, sdkKeysService, service };
  };

  it("rejects missing, invalid, and revoked SDK keys", async () => {
    const { service } = createService();

    await expect(service.authenticate(undefined)).rejects.toBeInstanceOf(UnauthorizedException);
    await expect(service.authenticate("unknown-secret")).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("authenticates valid SDK keys and updates last used time", async () => {
    const { sdkKeysService, service } = createService();

    const result = await service.authenticate("valid-secret");

    expect(result.environment).toMatchObject({ id: "environment-1", projectId: "project-1" });
    expect(sdkKeysService.markUsed).toHaveBeenCalledWith(expect.objectContaining({ id: "sdk-key-1" }));
  });
});
