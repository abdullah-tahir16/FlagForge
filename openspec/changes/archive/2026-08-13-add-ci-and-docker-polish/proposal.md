## Why

FlagForge now has the core management, evaluation, SDK, realtime, cache, audit, and analytics workflows implemented, but the project still relies on local developer commands for confidence and only ships infrastructure containers for PostgreSQL and Redis. This change makes the repo easier to verify, demo, and run from a clean machine or CI environment.

## What Changes

- Add a CI workflow that installs the pinned pnpm toolchain and runs root build, test, lint, and OpenSpec validation.
- Add Docker build artifacts for the backend API and frontend dashboard.
- Extend Docker Compose so developers can run the full stack, not only PostgreSQL and Redis.
- Add production-oriented environment examples and documentation for local containerized operation.
- Add smoke-check commands or scripts for health, seeded login readiness, SDK evaluation, and analytics/read-model verification where practical.
- Keep local development workflows intact for `pnpm dev`, `pnpm seed`, `pnpm build`, `pnpm test`, and `pnpm lint`.

## Capabilities

### New Capabilities

- `platform-operations`: CI verification, app containerization, full-stack compose operation, environment documentation, and smoke-check expectations.

### Modified Capabilities

- `platform-foundation`: Clarify that root verification and local infrastructure support the SDK workspace and full-stack Docker operation without changing the `frontend/` and `backend/` application boundaries.

## Impact

- Adds GitHub Actions workflow files under `.github/workflows/`.
- Adds Dockerfiles, Docker ignore files, and compose service updates for backend and frontend runtime images.
- Updates environment examples and README operational documentation.
- May add lightweight scripts for CI/OpenSpec validation and local smoke checks.
- Does not change public application APIs or feature flag evaluation semantics.
