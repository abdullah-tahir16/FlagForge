## Context

FlagForge has project-scoped boolean flags with per-environment `enabled` and `value` configuration. The SDK evaluation API authenticates with environment SDK keys and currently returns static boolean decisions: disabled configurations return false, enabled configurations return the stored boolean value.

Percentage rollout support changes evaluation from pure static lookup to deterministic context-aware evaluation. The change must preserve the existing NestJS/TypeORM/Postgres backend, React Router/TanStack Query frontend, React Final Form/Zod forms, token-driven dashboard UI, and audit logging conventions documented in `LLM_CONTEXT.md`.

## Goals / Non-Goals

**Goals:**

- Store `rolloutPercentage` per environment flag configuration.
- Let dashboard users edit rollout percentage using shared, token-driven controls.
- Accept SDK evaluation context request bodies with `userId` for deterministic rollout bucketing.
- Evaluate rollouts deterministically so the same flag, environment, and user receive a stable result.
- Preserve kill-switch behavior: disabled flag configurations always return false before rollout logic.
- Include rollout changes in audit snapshots and demo seed data.
- Cover rollout storage, validation, evaluation, UI, and audit behavior with focused tests.

**Non-Goals:**

- Targeting rules, segments, ordered rule evaluation, variants, or multivariate flags.
- Client SDK package creation.
- Evaluation event ingestion, analytics charts, Redis caching, or realtime updates.
- User attribute operators beyond accepting/pass-through evaluation context fields for later targeting.

## Decisions

### Store rollout percentage on `EnvironmentFlagConfig`

Add an integer `rolloutPercentage` column on `environment_flag_configs` with default `100`, bounded from 0 to 100 at DTO/service validation. Existing enabled flags keep current behavior after migration because 100% rollout serves the configured value to everyone.

Rationale: rollout is environment-specific operational configuration, just like enabled state and boolean value. Storing it on the config avoids introducing targeting/rule tables before they are needed.

Alternative considered: store rollout on `FeatureFlag`. That would make rollout identical across Development, Staging, and Production, which is not how gradual releases are normally operated.

### Use deterministic hash bucketing with environment isolation

Compute a stable bucket from `environmentId`, `flagKey`, and `userId`, then compare bucket `0..99` with `rolloutPercentage`.

Rationale: including environment prevents Development and Production rollout decisions from accidentally sharing buckets. Including flag key keeps rollout decisions independent across flags.

Alternative considered: hash only `flagKey:userId`, matching the README example. That is simpler, but environment-specific rollout config should not leak the same bucket assumptions across environments.

### Keep evaluation safe when `userId` is missing

SDK evaluation request bodies will accept an optional context object with `userId` and arbitrary future attributes. For this change, percentage rollout requires `userId`; if an enabled config has `rolloutPercentage` below 100 and no `userId` is provided, evaluation returns false with a rollout-missing-context reason.

Rationale: random fallback would violate deterministic rollout expectations. Returning true without context would overexpose partial rollouts.

Alternative considered: require `userId` for every SDK request. That would be a breaking change for current static boolean evaluation and demo clients.

### Preserve boolean `value` as the served value when included

Rollout only decides whether a user is included in the rollout cohort. If included, the evaluation returns the config `value`. If excluded, it returns false.

Rationale: this preserves existing boolean config semantics while adding gradual exposure for true-valued flags. A false-valued config can still be used as an explicit off value.

Alternative considered: make rollout always return true for included users. That would make the existing `value` field confusing and less useful.

### Reuse existing update and audit flows

Extend `UpdateEnvironmentFlagConfigDto`, response DTOs, frontend types, and the existing environment config form with `rolloutPercentage`. Use the existing `FEATURE_FLAG_CONFIG_UPDATED` audit action and include rollout changes in old/new snapshots.

Rationale: rollout percentage is a new field on the same resource, not a separate resource or action in this slice.

Alternative considered: introduce a separate rollout resource/action. That creates extra API and audit concepts before rule-based targeting exists.

## Risks / Trade-offs

- [Risk] Existing rows need a rollout value -> Mitigation: migration sets `rollout_percentage` to `100` with a not-null default.
- [Risk] Hash implementation differs across future SDKs -> Mitigation: keep the algorithm centralized on the backend now and document it in tests; client SDK local evaluation can later mirror the tested algorithm.
- [Risk] Missing `userId` surprises users during partial rollout -> Mitigation: dashboard copy and API reason metadata make missing-context behavior explicit.
- [Risk] UI becomes cramped in environment rows -> Mitigation: use compact grid tracks, stable control widths, and verify 375px, 1024px, and 1440px layouts.
- [Risk] Rollout percentage with `value=false` can look odd -> Mitigation: keep labels clear that rollout controls exposure and value controls served boolean for included users.

## Migration Plan

1. Add a TypeORM migration that adds `rollout_percentage integer not null default 100` to `environment_flag_configs`.
2. Update entities, DTOs, responses, frontend types, and seed data to include `rolloutPercentage`.
3. Update evaluation request DTOs and evaluation service logic.
4. Update dashboard forms and validation.
5. Add backend and frontend verification.

Rollback strategy: remove rollout UI/API use first, then roll back the migration by dropping `rollout_percentage`. Because the default preserves prior behavior, rollout deployment can be forward-compatible for existing data.

## Open Questions

- Should the dashboard label the 100% default as "Everyone" and 0% as "No one" in addition to the numeric control?
- Should a missing `userId` for partial rollout return a distinct reason such as `MISSING_CONTEXT`, or a rollout-specific reason such as `ROLLOUT_CONTEXT_MISSING`?
