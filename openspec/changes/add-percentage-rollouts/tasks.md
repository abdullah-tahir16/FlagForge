## 1. Documentation and Planning Alignment

- [x] 1.1 Read `LLM_CONTEXT.md`, README rollout/evaluation sections, current main specs, and archived audit artifacts before implementation.
- [x] 1.2 Update `docs/ROADMAP.md` so `add-audit-logs` is archived and `add-percentage-rollouts` is active.
- [x] 1.3 Update `README.md` with rollout configuration, evaluation request body, reason metadata, and demo seed behavior.

## 2. Backend Rollout Data Model

- [x] 2.1 Add a TypeORM migration for `environment_flag_configs.rollout_percentage` with integer type, not-null constraint, default `100`, and rollback.
- [x] 2.2 Add `rolloutPercentage` to `EnvironmentFlagConfig` entity and environment flag config response DTO.
- [x] 2.3 Include default `rolloutPercentage: 100` when feature flag creation creates environment configs.
- [x] 2.4 Extend `UpdateEnvironmentFlagConfigDto` with integer validation for values from 0 through 100.
- [x] 2.5 Extend feature flag response mapping and audit config snapshots to include rollout percentage changes.
- [x] 2.6 Update local seed data so at least one demo flag environment config uses a representative rollout percentage.

## 3. Backend SDK Evaluation

- [x] 3.1 Add SDK evaluation request DTOs that accept optional `userId` and additional primitive context attributes.
- [x] 3.2 Update `EvaluationsController` to pass evaluation request body context to single-flag and all-flag evaluation.
- [x] 3.3 Add a deterministic rollout bucket helper or service using environment id, flag key, and user id.
- [x] 3.4 Extend evaluation reason types with percentage rollout and missing rollout context reasons.
- [x] 3.5 Update single-flag evaluation so disabled configs return false before rollout logic.
- [x] 3.6 Update single-flag evaluation for 0%, 100%, partial rollout with `userId`, and partial rollout without `userId`.
- [x] 3.7 Update all-flags evaluation to apply rollout logic independently per flag and return per-flag reason metadata.

## 4. Backend Tests

- [x] 4.1 Add feature flag service tests for rollout percentage validation, persistence, response mapping, and audit snapshots.
- [x] 4.2 Add evaluation service tests for disabled override, 0%, 100%, deterministic partial rollout, stable same-user decisions, and missing `userId`.
- [x] 4.3 Add evaluation controller tests for forwarding SDK evaluation body context.
- [x] 4.4 Add or update seed tests/manual verification so demo rollout data remains idempotent.

## 5. Frontend Domain and API Updates

- [x] 5.1 Add `rolloutPercentage` to frontend feature flag domain types and transport DTOs.
- [x] 5.2 Update feature flag API request payloads for environment config updates.
- [x] 5.3 Extend environment config React Final Form/Zod schema to validate rollout percentage from 0 through 100.
- [x] 5.4 Update presentation hook submit handling so rollout percentage is parsed and submitted without breaking boolean fields.

## 6. Frontend Rollout UI

- [x] 6.1 Add a compact rollout percentage control to each feature flag environment config row using shared/common controls where practical.
- [x] 6.2 Show rollout state in row badges or supporting metadata without relying on color alone.
- [x] 6.3 Preserve token-driven styling with semantic `app-*` utilities and no raw Tailwind palette colors.
- [x] 6.4 Verify 375px, 1024px, and 1440px layouts for flag detail rows, toggles, rollout controls, badges, and save actions.

## 7. Final Verification

- [x] 7.1 Run `corepack pnpm --filter @flagforge/backend test`.
- [x] 7.2 Run `corepack pnpm --filter @flagforge/frontend build`.
- [x] 7.3 Run root `corepack pnpm build`, `corepack pnpm test`, and `corepack pnpm lint`.
- [x] 7.4 Run `pnpm seed` and verify demo rollout values are visible in the dashboard.
- [x] 7.5 Verify SDK evaluation manually with a demo SDK key for 0%, 100%, partial rollout with `userId`, and partial rollout without `userId`.
- [x] 7.6 Run OpenSpec status/apply checks for `add-percentage-rollouts`.
- [x] 7.7 Run `openspec validate add-percentage-rollouts --strict`.
