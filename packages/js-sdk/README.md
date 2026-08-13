# @flagforge/js-sdk

JavaScript and TypeScript SDK for evaluating FlagForge feature flags from browser or Node applications.

## Usage

```ts
import { createFlagForgeClient } from "@flagforge/js-sdk";

const flagForge = createFlagForgeClient({
  apiUrl: "http://localhost:3001/api/v1",
  sdkKey: "ff_development_sk_local_demo_key",
  timeoutMs: 3000
});

const enabled = await flagForge.isEnabled("new-checkout", {
  country: "IT",
  plan: "premium",
  userId: "user-123"
});
```

## API

```ts
const flagForge = createFlagForgeClient({
  apiUrl: "http://localhost:3001/api/v1",
  sdkKey: "ff_development_sk_local_demo_key",
  defaultValue: false,
  timeoutMs: 5000
});
```

- `isEnabled(flagKey, context?, defaultValue?)`: returns a boolean and falls back to `defaultValue` or `false`.
- `evaluate(flagKey, context?, options?)`: returns the evaluated value plus reason and environment metadata.
- `evaluateAll(context?, options?)`: returns all flag values and per-flag reason metadata.

Evaluation context supports `userId` and primitive attributes:

```ts
await flagForge.evaluate("new-checkout", {
  country: "IT",
  plan: "premium",
  userId: "user-123"
});
```

Unsupported nested objects or arrays are ignored before request serialization.

## Safe Defaults

The SDK fails closed by default. Network errors, timeouts, unauthorized responses, server errors, and malformed responses return safe fallback values instead of throwing from evaluation methods.

```ts
const enabled = await flagForge.isEnabled("new-checkout", { userId: "user-123" }, false);
```

Use detailed methods when you need fallback metadata:

```ts
const result = await flagForge.evaluate("new-checkout", { userId: "user-123" });

if (result.fallback) {
  console.warn(result.error.reason);
}
```

## Custom Fetch

Modern browsers and Node 26+ provide `fetch`. You can inject a compatible implementation for tests or custom runtimes:

```ts
const flagForge = createFlagForgeClient({
  apiUrl: "http://localhost:3001/api/v1",
  fetch: customFetch,
  sdkKey: "ff_development_sk_local_demo_key"
});
```
