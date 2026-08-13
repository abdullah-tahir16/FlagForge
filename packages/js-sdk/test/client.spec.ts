import { createFlagForgeClient } from "../src";
import type { FlagForgeFetch, FlagForgeFetchInit, FlagForgeFetchResponse } from "../src";

const jsonResponse = (payload: unknown, status = 200): FlagForgeFetchResponse => ({
  json: jest.fn(async () => payload),
  ok: status >= 200 && status < 300,
  status
});

const singleResponse = {
  environment: {
    id: "environment-1",
    key: "development",
    name: "Development",
    projectId: "project-1"
  },
  evaluatedAt: "2026-08-13T00:00:00.000Z",
  key: "new-checkout",
  reason: "STATIC",
  value: true
};

const allResponse = {
  environment: {
    id: "environment-1",
    key: "development",
    name: "Development",
    projectId: "project-1"
  },
  evaluatedAt: "2026-08-13T00:00:00.000Z",
  flags: {
    "beta-navigation": false,
    "new-checkout": true
  },
  reasons: {
    "beta-navigation": {
      reason: "DISABLED",
      value: false
    },
    "new-checkout": {
      reason: "STATIC",
      value: true
    }
  }
};

describe("createFlagForgeClient", () => {
  it("sends single flag evaluation requests with SDK key header and primitive context body", async () => {
    const fetchMock = jest.fn(async () => jsonResponse(singleResponse));
    const client = createFlagForgeClient({
      apiUrl: "http://localhost:3001/api/v1/",
      fetch: fetchMock,
      sdkKey: "ff_development_sk_local_demo_key"
    });

    await expect(
      client.evaluate("new-checkout", {
        country: "IT",
        nested: { ignored: true } as never,
        plan: "premium",
        userId: "user-123"
      })
    ).resolves.toMatchObject({
      fallback: false,
      reason: "STATIC",
      value: true
    });

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/v1/sdk/evaluate/new-checkout",
      expect.objectContaining({
        body: JSON.stringify({
          country: "IT",
          plan: "premium",
          userId: "user-123"
        }),
        headers: {
          "Content-Type": "application/json",
          "X-FlagForge-Key": "ff_development_sk_local_demo_key"
        },
        method: "POST"
      })
    );
  });

  it("returns successful API values from isEnabled", async () => {
    const fetchMock = jest.fn(async () => jsonResponse(singleResponse));
    const client = createFlagForgeClient({
      apiUrl: "http://localhost:3001/api/v1",
      fetch: fetchMock,
      sdkKey: "sdk-key"
    });

    await expect(client.isEnabled("new-checkout", { userId: "user-123" })).resolves.toBe(true);
  });

  it("exposes detailed reason and environment metadata", async () => {
    const fetchMock = jest.fn(async () =>
      jsonResponse({
        ...singleResponse,
        reason: "TARGETING_RULE_MATCH",
        targetingRule: {
          attribute: "country",
          id: "rule-1",
          operator: "EQUALS",
          source: "ATTRIBUTE"
        }
      })
    );
    const client = createFlagForgeClient({
      apiUrl: "http://localhost:3001/api/v1",
      fetch: fetchMock,
      sdkKey: "sdk-key"
    });

    await expect(client.evaluate("new-checkout", { country: "IT" })).resolves.toMatchObject({
      environment: { key: "development" },
      fallback: false,
      targetingRule: { id: "rule-1", source: "ATTRIBUTE" }
    });
  });

  it("evaluates all flags with values and per-flag reasons", async () => {
    const fetchMock = jest.fn(async () => jsonResponse(allResponse));
    const client = createFlagForgeClient({
      apiUrl: "http://localhost:3001/api/v1",
      fetch: fetchMock,
      sdkKey: "sdk-key"
    });

    await expect(client.evaluateAll({ userId: "user-123" })).resolves.toMatchObject({
      fallback: false,
      flags: {
        "beta-navigation": false,
        "new-checkout": true
      },
      reasons: {
        "new-checkout": { reason: "STATIC", value: true }
      }
    });
    expect(fetchMock).toHaveBeenCalledWith("http://localhost:3001/api/v1/sdk/evaluate", expect.any(Object));
  });

  it("returns safe defaults for network failures, unauthorized responses, and malformed responses", async () => {
    const networkClient = createFlagForgeClient({
      apiUrl: "http://localhost:3001/api/v1",
      fetch: jest.fn(async () => {
        throw new Error("offline");
      }),
      sdkKey: "sdk-key"
    });
    const unauthorizedClient = createFlagForgeClient({
      apiUrl: "http://localhost:3001/api/v1",
      fetch: jest.fn(async () => jsonResponse({ message: "Unauthorized" }, 401)),
      sdkKey: "sdk-key"
    });
    const malformedClient = createFlagForgeClient({
      apiUrl: "http://localhost:3001/api/v1",
      fetch: jest.fn(async () => jsonResponse({ value: "not boolean" })),
      sdkKey: "sdk-key"
    });

    await expect(networkClient.isEnabled("new-checkout")).resolves.toBe(false);
    await expect(unauthorizedClient.isEnabled("new-checkout", undefined, true)).resolves.toBe(true);
    await expect(malformedClient.evaluate("new-checkout", undefined, { defaultValue: true })).resolves.toMatchObject({
      error: { reason: "MALFORMED_RESPONSE" },
      fallback: true,
      value: true
    });
  });

  it("returns fallback flags for failed all-flags evaluation", async () => {
    const client = createFlagForgeClient({
      apiUrl: "http://localhost:3001/api/v1",
      fetch: jest.fn(async () => jsonResponse({ flags: [] })),
      sdkKey: "sdk-key"
    });

    await expect(client.evaluateAll(undefined, { fallbackFlags: { "new-checkout": false } })).resolves.toMatchObject({
      error: { reason: "MALFORMED_RESPONSE" },
      fallback: true,
      flags: { "new-checkout": false },
      reasons: {}
    });
  });

  it("uses injected fetch, custom base URL, and timeout abort behavior", async () => {
    jest.useFakeTimers();

    const timeoutFetch: jest.MockedFunction<FlagForgeFetch> = jest.fn(
      (_input: string | URL, init?: FlagForgeFetchInit) =>
        new Promise((_resolve, reject) => {
          init?.signal?.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")));
        })
    );
    const client = createFlagForgeClient({
      apiUrl: "https://flags.example.test",
      fetch: timeoutFetch,
      sdkKey: "sdk-key",
      timeoutMs: 25
    });

    const result = client.evaluate("new-checkout", undefined, { defaultValue: true });
    jest.advanceTimersByTime(25);

    await expect(result).resolves.toMatchObject({
      error: { reason: "TIMEOUT" },
      fallback: true,
      value: true
    });
    expect(timeoutFetch).toHaveBeenCalledWith("https://flags.example.test/sdk/evaluate/new-checkout", expect.any(Object));

    jest.useRealTimers();
  });

  it("rejects invalid client configuration at creation time", () => {
    expect(() => createFlagForgeClient({ apiUrl: " ", fetch: jest.fn(), sdkKey: "sdk-key" })).toThrow("apiUrl");
    expect(() => createFlagForgeClient({ apiUrl: "http://localhost:3001/api/v1", fetch: jest.fn(), sdkKey: " " })).toThrow(
      "sdkKey"
    );
  });
});
