## Why

FlagForge can evaluate flags through HTTP, but application developers still need to hand-roll request code, authentication headers, safe defaults, and error handling. A first-party JavaScript SDK turns the evaluation API into a reusable product surface and makes the local demo flow closer to how teams would actually integrate feature flags.

## What Changes

- Add a first-party TypeScript JavaScript SDK package for browser and Node consumers.
- Provide a small client API for single-flag boolean checks and all-flag evaluation.
- Use existing environment SDK keys through the `X-FlagForge-Key` header.
- Preserve safe default behavior when the network, server, or authentication fails.
- Add package build, lint, and test wiring to the pnpm workspace.
- Add SDK usage documentation and local demo examples.

No backend evaluation semantics change in this scope.

## Capabilities

### New Capabilities

- `js-sdk-client`: Defines the JavaScript SDK package, public client API, request behavior, safe defaults, TypeScript types, and tests.

### Modified Capabilities

- `platform-foundation`: Extends the pnpm workspace and root verification workflow to include the JavaScript SDK package.

## Impact

- Adds a new workspace library package, likely under `packages/js-sdk/`.
- Updates root workspace configuration so build, lint, and test include the SDK.
- Adds SDK source, package metadata, TypeScript build output, and focused tests.
- Updates README or package documentation with installation and local evaluation examples.
