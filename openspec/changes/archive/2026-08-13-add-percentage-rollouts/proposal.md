## Why

FlagForge currently evaluates boolean flags as static per-environment values, which makes it useful for kill switches but not gradual releases. Percentage rollouts are the next step because they let teams expose a feature to a deterministic subset of users before full release.

## What Changes

- Add per-environment rollout percentage configuration for boolean feature flags.
- Extend SDK evaluation requests to accept a stable evaluation context, including `userId`.
- Evaluate enabled flags using deterministic bucketing when rollout percentage is between 0 and 100.
- Preserve kill-switch behavior: disabled flag configurations always evaluate to false before rollout logic.
- Return rollout-specific reason metadata from single and all-flags SDK evaluation responses.
- Add dashboard controls for editing rollout percentage alongside enabled/value configuration.
- Emit audit events when rollout percentage changes.
- Seed local demo flag configurations with representative rollout values.
- Update README and roadmap notes for the rollout workflow and API body behavior.

## Capabilities

### New Capabilities

- None.

### Modified Capabilities

- `feature-flag-management`: Environment flag configuration gains rollout percentage management, validation, demo data, and audit snapshots.
- `flag-evaluation-api`: SDK evaluation accepts evaluation context and returns deterministic rollout decisions with reason metadata.
- `dashboard-ui-foundation`: Feature flag detail UI exposes token-driven rollout controls that remain responsive and accessible.
- `audit-log-management`: Audit entries capture rollout percentage changes in environment flag config snapshots.

## Impact

- Backend: TypeORM entity and migration for rollout percentage, feature flag DTOs/service validation, evaluation request DTOs, deterministic rollout helper/service, audit snapshots, seed data, and Jest coverage.
- Frontend: feature flag domain/API types, React Final Form/Zod config forms, per-environment rollout controls, copy/empty/loading/error states using shared primitives and theme tokens.
- Public SDK API: `POST /api/v1/sdk/evaluate` and `POST /api/v1/sdk/evaluate/:flagKey` request bodies accept evaluation context. Existing clients without `userId` continue to get safe deterministic/static behavior as specified.
- Docs: README demo flow, evaluation examples, and roadmap status.
