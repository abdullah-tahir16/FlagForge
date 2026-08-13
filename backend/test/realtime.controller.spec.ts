import { UnauthorizedException } from "@nestjs/common";
import type { Request, Response } from "express";
import { RealtimeController } from "../src/realtime/realtime.controller";
import { UserRole } from "../src/users/user-role.enum";

const createResponse = () =>
  ({
    end: jest.fn(),
    flushHeaders: jest.fn(),
    setHeader: jest.fn(),
    write: jest.fn()
  }) as unknown as Response;

const createRequest = (authorization?: string) => {
  const handlers = new Map<string, () => void>();

  return {
    headers: authorization ? { authorization } : {},
    on: jest.fn((event: string, handler: () => void) => {
      handlers.set(event, handler);
      return undefined;
    }),
    trigger: (event: string) => handlers.get(event)?.()
  } as unknown as Request & { trigger: (event: string) => void };
};

describe("RealtimeController", () => {
  it("rejects requests without a bearer token", async () => {
    const controller = new RealtimeController({ get: jest.fn() } as never, { verifyAsync: jest.fn() } as never, {} as never);

    await expect(controller.streamEvents(createRequest(), createResponse())).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it("opens an event stream and cleans up on request close", async () => {
    jest.useFakeTimers();

    const unsubscribe = jest.fn();
    const realtimePublisher = {
      createHeartbeatFrame: jest.fn(() => ": heartbeat\n\n"),
      subscribe: jest.fn((_user, _send) => ({ id: "subscription-1", unsubscribe }))
    };
    const controller = new RealtimeController(
      { get: jest.fn(() => "secret") } as never,
      {
        verifyAsync: jest.fn(async () => ({
          email: "owner@example.com",
          organizationId: "org-1",
          role: UserRole.Owner,
          sub: "user-1"
        }))
      } as never,
      realtimePublisher as never
    );
    const request = createRequest("Bearer access-token");
    const response = createResponse();

    await controller.streamEvents(request, response);

    expect(response.setHeader).toHaveBeenCalledWith("Content-Type", "text/event-stream");
    expect(response.write).toHaveBeenCalledWith(": connected\n\n");
    expect(realtimePublisher.subscribe).toHaveBeenCalledWith(
      expect.objectContaining({ id: "user-1", organizationId: "org-1" }),
      expect.any(Function)
    );

    request.trigger("close");
    expect(unsubscribe).toHaveBeenCalled();
    expect(response.end).toHaveBeenCalled();

    jest.useRealTimers();
  });
});
