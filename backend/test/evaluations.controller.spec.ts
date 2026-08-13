import { EvaluationsController } from "../src/evaluations/evaluations.controller";
import { EvaluationsService } from "../src/evaluations/evaluations.service";
import { SdkAuthService } from "../src/evaluations/sdk-auth.service";

describe("EvaluationsController", () => {
  const context = {
    environment: { id: "environment-1", key: "development", name: "Development", projectId: "project-1" },
    sdkKey: { id: "sdk-key-1" }
  };

  const createController = () => {
    const authService = {
      authenticate: jest.fn(async () => context)
    };
    const evaluationsService = {
      evaluateAll: jest.fn(async () => ({ flags: {}, reasons: {} })),
      evaluateOne: jest.fn(async () => ({ key: "new-checkout", reason: "STATIC", value: true }))
    };
    const controller = new EvaluationsController(
      evaluationsService as unknown as EvaluationsService,
      authService as unknown as SdkAuthService
    );

    return { authService, controller, evaluationsService };
  };

  it("authenticates and routes single flag evaluation", async () => {
    const { authService, controller, evaluationsService } = createController();

    await expect(controller.evaluateOne("sdk-secret", "new-checkout")).resolves.toMatchObject({
      key: "new-checkout",
      value: true
    });

    expect(authService.authenticate).toHaveBeenCalledWith("sdk-secret");
    expect(evaluationsService.evaluateOne).toHaveBeenCalledWith(context, "new-checkout");
  });

  it("authenticates and routes all flag evaluation", async () => {
    const { authService, controller, evaluationsService } = createController();

    await expect(controller.evaluateAll("sdk-secret")).resolves.toMatchObject({ flags: {} });

    expect(authService.authenticate).toHaveBeenCalledWith("sdk-secret");
    expect(evaluationsService.evaluateAll).toHaveBeenCalledWith(context);
  });
});
