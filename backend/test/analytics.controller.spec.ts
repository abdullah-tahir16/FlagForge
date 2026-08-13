import { AnalyticsController } from "../src/analytics/analytics.controller";
import { UserRole } from "../src/users/user-role.enum";

const owner = {
  email: "owner@example.com",
  id: "user-1",
  organizationId: "org-1",
  role: UserRole.Owner
};

describe("AnalyticsController", () => {
  it("delegates project overview requests to the analytics service", async () => {
    const analyticsService = {
      getProjectOverview: jest.fn(async () => ({
        falseCount: 0,
        filters: { environmentId: null, flagKey: null, range: "7d" },
        reasonBreakdown: [],
        timeBuckets: [],
        topFlags: [],
        totalEvaluations: 0,
        trueCount: 0
      }))
    };
    const controller = new AnalyticsController(analyticsService as never);

    await expect(controller.getOverview(owner, "project-1", { range: "24h" })).resolves.toMatchObject({
      filters: { range: "7d" },
      totalEvaluations: 0
    });
    expect(analyticsService.getProjectOverview).toHaveBeenCalledWith(owner, "project-1", { range: "24h" });
  });
});
