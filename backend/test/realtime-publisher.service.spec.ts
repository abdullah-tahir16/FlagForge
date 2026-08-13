import { RealtimeEventAction } from "../src/realtime/realtime-event-action.enum";
import { RealtimeResourceType } from "../src/realtime/realtime-resource-type.enum";
import { RealtimePublisherService } from "../src/realtime/realtime-publisher.service";
import { UserRole } from "../src/users/user-role.enum";

describe("RealtimePublisherService", () => {
  it("delivers configuration events only to subscribers in the same organization", () => {
    const service = new RealtimePublisherService();
    const orgSubscriber = jest.fn();
    const otherSubscriber = jest.fn();

    service.subscribe(
      {
        email: "owner@example.com",
        id: "user-1",
        organizationId: "org-1",
        role: UserRole.Owner
      },
      orgSubscriber
    );
    service.subscribe(
      {
        email: "other@example.com",
        id: "user-2",
        organizationId: "org-2",
        role: UserRole.Owner
      },
      otherSubscriber
    );

    service.publishConfigurationChanged({
      action: RealtimeEventAction.Updated,
      environmentIds: ["environment-1"],
      organizationId: "org-1",
      projectId: "project-1",
      resourceId: "flag-1",
      resourceType: RealtimeResourceType.FeatureFlag
    });

    expect(orgSubscriber).toHaveBeenCalledWith(expect.stringContaining("event: CONFIGURATION_CHANGED"));
    expect(orgSubscriber).toHaveBeenCalledWith(expect.stringContaining('"resourceId":"flag-1"'));
    expect(otherSubscriber).not.toHaveBeenCalled();
  });

  it("removes subscribers and keeps publisher failures isolated", () => {
    const service = new RealtimePublisherService();
    const failingSubscriber = jest.fn(() => {
      throw new Error("client closed");
    });
    const activeSubscriber = jest.fn();
    const subscription = service.subscribe(
      {
        email: "owner@example.com",
        id: "user-1",
        organizationId: "org-1",
        role: UserRole.Owner
      },
      failingSubscriber
    );
    service.subscribe(
      {
        email: "admin@example.com",
        id: "user-2",
        organizationId: "org-1",
        role: UserRole.Admin
      },
      activeSubscriber
    );

    expect(() =>
      service.publishConfigurationChanged({
        action: RealtimeEventAction.Deleted,
        organizationId: "org-1",
        projectId: "project-1",
        resourceId: "rule-1",
        resourceType: RealtimeResourceType.TargetingRule
      })
    ).not.toThrow();
    expect(activeSubscriber).toHaveBeenCalled();

    subscription.unsubscribe();
    expect(service.getSubscriberCount()).toBe(1);
  });
});
