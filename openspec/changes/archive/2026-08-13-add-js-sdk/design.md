## Context

FlagForge already exposes SDK-key authenticated evaluation endpoints:

- `POST /api/v1/sdk/evaluate/:flagKey` for one boolean flag.
- `POST /api/v1/sdk/evaluate` for all boolean flags in the SDK key's environment.

Those endpoints use `X-FlagForge-Key`, accept a primitive evaluation context, return reason metadata, and fail safely at the API level for missing flags or disabled configs. Developers still need a stable client package that hides request construction, normalizes operational failures into safe defaults, and provides TypeScript types for evaluation context and results.

The repo is currently a pnpm workspace with `frontend/` and `backend/`. This change introduces a library package without changing backend evaluation semantics.

## Goals / Non-Goals

**Goals:**

- Add a first-party TypeScript SDK package consumable from browser and Node runtimes.
- Expose a compact client API for `isEnabled`, single-flag detail evaluation, and all-flag evaluation.
- Use existing SDK keys through the `X-FlagForge-Key` header.
- Provide safe fallback values when requests fail, time out, or receive malformed responses.
- Include build, lint, and test coverage in the root workspace workflow.
- Document local usage with the seeded demo SDK key.

**Non-Goals:**

- No backend evaluation behavior changes.
- No streaming, SSE, WebSocket, long polling, or client-side realtime cache in the SDK.
- No local persistent flag cache or offline bootstrap file.
- No SDK analytics event batching.
- No React-specific SDK provider or hook package.
- No npm publishing automation beyond package metadata/build output.

## Decisions

### Package location

Create the SDK as a workspace library under `packages/js-sdk/` with package name `@flagforge/js-sdk`.

Rationale: `frontend/` and `backend/` remain application folders, while reusable distributable libraries belong under `packages/`. This keeps app boundaries clean and lets future SDKs or shared libraries use the same convention.

Alternative considered: place SDK under `sdk/js/`. That reads well, but it does not match common pnpm library package conventions as directly as `packages/js-sdk/`.

### Runtime and build target

Implement the SDK in TypeScript and build dual ESM/CJS output plus declaration files.

Rationale: browser bundlers prefer ESM, some Node consumers still need CJS, and TypeScript users need exported types. The package should not depend on React, NestJS, Axios, or dashboard infrastructure.

Alternative considered: ESM only. Simpler, but less friendly for common Node usage during the MVP stage.

### HTTP transport

Use the global `fetch` API by default and allow callers to inject a compatible `fetch` implementation.

Rationale: Node 26 and modern browsers provide `fetch`; injection keeps tests simple and supports older or specialized runtimes without adding a transport dependency.

Alternative considered: add Axios. That would increase package size and duplicate behavior already easy to express with `fetch`.

### Public API shape

Expose `createFlagForgeClient(options)` returning methods:

- `isEnabled(flagKey, context?, defaultValue?)`
- `evaluate(flagKey, context?, options?)`
- `evaluateAll(context?, options?)`

Rationale: `isEnabled` covers the common boolean check. `evaluate` and `evaluateAll` expose metadata for debugging and advanced callers.

### Safe defaults

The SDK must return caller-provided defaults on network, timeout, unauthorized, malformed response, and other transport/server failures.

Rationale: feature flag clients should not break application rendering or request handling when the flag service is unreachable. The backend remains the source of truth when reachable.

### Context handling

Accept `userId` and additional primitive context attributes. The SDK should pass context through without attempting to evaluate targeting locally.

Rationale: targeting and rollout semantics live on the backend. The SDK should avoid duplicating server logic and only filter out clearly unsupported values if needed to keep request bodies JSON-safe.

## Risks / Trade-offs

- Runtime `fetch` availability varies by environment -> require Node 26+ for default fetch and support injected `fetch` for tests or older runtimes.
- Safe defaults can hide operational issues -> expose metadata on `evaluate`/`evaluateAll` indicating fallback/error behavior while keeping `isEnabled` simple.
- Dual package output can be misconfigured -> add package export tests or import smoke tests for ESM/CJS where feasible.
- SDK package increases workspace scope -> update root `pnpm-workspace.yaml` and root scripts so CI-like commands include the SDK.
- No realtime means clients do not receive instant updates -> document that the first SDK performs request-time evaluation only; realtime SDK streaming needs a later change.
