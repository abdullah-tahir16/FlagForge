## 1. Workspace Package Setup

- [x] 1.1 Update `pnpm-workspace.yaml` to include `packages/*` workspace packages.
- [x] 1.2 Create `packages/js-sdk/` with package metadata for `@flagforge/js-sdk`.
- [x] 1.3 Add SDK TypeScript configuration and build output settings for JavaScript and declaration files.
- [x] 1.4 Add SDK package scripts for build, lint, and test.
- [x] 1.5 Confirm root build, lint, and test scripts include the SDK package through workspace recursion.

## 2. Public SDK Types

- [x] 2.1 Define public client option types including API base URL, SDK key, timeout, and fetch override.
- [x] 2.2 Define evaluation context types supporting `userId` and primitive context attributes.
- [x] 2.3 Define single-flag and all-flags evaluation response types matching the backend API shape.
- [x] 2.4 Define fallback option and SDK error/fallback metadata types for safe evaluation outcomes.
- [x] 2.5 Export all public types from the SDK package entrypoint.

## 3. SDK Client Implementation

- [x] 3.1 Implement `createFlagForgeClient(options)` with normalized API base URL and SDK key validation.
- [x] 3.2 Implement the internal fetch transport using `X-FlagForge-Key`, JSON bodies, and JSON response parsing.
- [x] 3.3 Implement request timeout behavior with abort handling.
- [x] 3.4 Implement `evaluate(flagKey, context?, options?)` for detailed single-flag evaluation.
- [x] 3.5 Implement `isEnabled(flagKey, context?, defaultValue?)` for common boolean checks.
- [x] 3.6 Implement `evaluateAll(context?, options?)` for all-flag evaluation.
- [x] 3.7 Ensure network, timeout, unauthorized, server, and malformed-response failures return safe fallbacks.
- [x] 3.8 Ensure unsupported non-primitive context values are excluded or ignored before request serialization.

## 4. SDK Tests

- [x] 4.1 Add tests proving single-flag evaluation sends the correct URL, method, SDK key header, and context body.
- [x] 4.2 Add tests proving `isEnabled` returns successful API values.
- [x] 4.3 Add tests proving detailed evaluation exposes reason and environment metadata.
- [x] 4.4 Add tests proving all-flags evaluation exposes flags and per-flag reasons.
- [x] 4.5 Add tests for network failure, unauthorized response, timeout, and malformed response safe defaults.
- [x] 4.6 Add tests for injected fetch usage and custom API base URL handling.
- [x] 4.7 Add type/build coverage proving public TypeScript declarations are emitted.

## 5. Documentation

- [x] 5.1 Add SDK README or package documentation with installation/import examples.
- [x] 5.2 Update root README with a local `@flagforge/js-sdk` example using `ff_development_sk_local_demo_key`.
- [x] 5.3 Document `isEnabled`, `evaluate`, `evaluateAll`, context attributes, safe defaults, and timeout behavior.
- [x] 5.4 Update `LLM_CONTEXT.md` with durable guidance for SDK package structure and safe-default behavior.
- [x] 5.5 Update `docs/ROADMAP.md` to reflect JavaScript SDK progress and the next likely analytics step.

## 6. Verification

- [x] 6.1 Run `openspec validate add-js-sdk --strict`.
- [x] 6.2 Run `corepack pnpm build`.
- [x] 6.3 Run `corepack pnpm test`.
- [x] 6.4 Run `corepack pnpm lint`.
- [x] 6.5 Run a local or mocked SDK usage smoke check against the evaluation API if feasible.
