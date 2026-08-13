## Context

FlagForge currently manages boolean flags with per-environment enabled/value settings and rollout percentage. SDK evaluation accepts context for rollout identity, but additional context attributes are not yet used for targeting. The README defines ordered targeting rules, MVP operators, and an evaluation order where explicit/attribute matching happens before percentage rollout.

The existing product model is environment scoped for configuration. Targeting must therefore attach to the environment flag configuration rather than the global feature flag so Development, Staging, and Production can have different rule sets.

## Goals / Non-Goals

**Goals:**

- Persist ordered targeting rules for boolean feature flag environment configurations.
- Provide authenticated management APIs to list, create, update, delete, and reorder rules.
- Apply rules during SDK evaluation before percentage rollout fallback.
- Support the README MVP operator set with deterministic, testable semantics.
- Expose targeting management in the dashboard using the existing token-driven UI system, React Final Form, and Zod.
- Record audit events for targeting rule mutations.
- Seed representative local demo rules for the demo project.

**Non-Goals:**

- Reusable segments.
- Multi-condition rule groups and nested `AND`/`OR` expressions.
- Explicit individual user targeting as a separate model.
- Variant flags or non-boolean rule results.
- Regex or semantic-version operators listed as future README work.

## Decisions

### Scope rules to environment flag configs

Targeting rules SHALL reference the environment flag configuration row. The management API should be nested under project, flag, and environment identifiers, for example:

```text
GET    /api/v1/projects/:projectId/flags/:flagId/environments/:environmentId/rules
POST   /api/v1/projects/:projectId/flags/:flagId/environments/:environmentId/rules
PATCH  /api/v1/projects/:projectId/flags/:flagId/environments/:environmentId/rules/:ruleId
DELETE /api/v1/projects/:projectId/flags/:flagId/environments/:environmentId/rules/:ruleId
POST   /api/v1/projects/:projectId/flags/:flagId/environments/:environmentId/rules/reorder
```

This differs from the README's shorter flag-level examples, but it preserves the current domain boundary where served value and rollout configuration are already environment-specific.

Alternative considered: global flag-level rules. That would be simpler routes, but it would make it impossible to target differently by environment without adding override logic later.

### Store one condition per MVP rule

Each MVP rule stores:

- `id`
- `environmentFlagConfigId`
- `attribute`
- `operator`
- `comparisonValue` as JSONB
- `resultValue` as boolean
- `sortOrder`
- timestamps

One condition per rule keeps the first implementation compact and maps directly to README examples such as `country EQUALS IT THEN true`. Multi-condition rule groups can be added later by introducing a condition table or JSON condition group without breaking single-condition rules.

Alternative considered: JSON condition trees immediately. That would support complex examples now, but it increases validation, UI, and testing cost before the simpler ordered-rule workflow exists.

### Evaluate first matching rule before rollout

SDK evaluation SHALL load enabled flag config with its ordered targeting rules. If the config is disabled, evaluation returns false before targeting. If enabled, rules run in `sortOrder` ascending order. The first matching rule returns its `resultValue` with targeting reason metadata. If no rule matches, evaluation falls back to existing rollout/static behavior.

Alternative considered: evaluate rollout first. That conflicts with the README ordering and makes targeted allow/deny rules less predictable.

### Define strict operator semantics

Operators SHALL be implemented with explicit primitive handling:

- `EQUALS` / `NOT_EQUALS`: exact comparison across string, number, and boolean values after validating comparable primitive types.
- `CONTAINS` / `NOT_CONTAINS`: substring match for strings or membership match for arrays.
- `STARTS_WITH` / `ENDS_WITH`: string-only comparisons.
- `IN` / `NOT_IN`: comparison value MUST be an array and checks primitive membership.
- Numeric comparison operators require numeric context and comparison values; nonnumeric input does not match.
- Missing attributes never match positive operators and count as non-match for rule evaluation.

The API validation layer should reject invalid operator/value combinations where practical so saved rules are predictable.

### Keep rule listing unpaginated for now

Rule lists are expected to remain short because ordering is meaningful and the dashboard must show the complete ordered stack. Cursor pagination remains the default for unbounded feeds and history screens, but rule management should return the full ordered rule list.

### Integrate with existing UI architecture

Frontend code should follow the established domain folders and use common controls:

- domain types under `frontend/src/core/types/TargetingRules`
- API calls under `frontend/src/infrastructure/api/TargetingRules`
- query/mutation hooks under `frontend/src/infrastructure/hooks/TargetingRules`
- orchestration under `frontend/src/infrastructure/useCases/TargetingRules`
- flag detail rule manager under presentation components

Rule forms use React Final Form and Zod. Controls use semantic theme tokens, shared Common form wrappers, lucide icons, and responsive layouts verified at 375px, 1024px, and 1440px.

## Risks / Trade-offs

- [Risk] Rule ordering writes can race when two admins reorder at the same time. -> Use a transaction for reorder and persist an explicit ordered id list; last write wins is acceptable for the MVP.
- [Risk] JSONB comparison values can become inconsistent across operators. -> Validate DTOs with operator-aware Zod/class-validator logic and cover each operator in Jest tests.
- [Risk] Evaluation queries may grow heavier once rules are included. -> Load rules only for the evaluated environment config and order by indexed `sortOrder`; revisit caching in the planned Redis change.
- [Risk] The dashboard can become visually noisy. -> Keep the rule manager compact, use dense rows, avoid nested cards, and place editing in a focused panel or modal.

## Migration Plan

1. Add the targeting rule table with a foreign key to environment flag configurations and a unique order constraint per config where practical.
2. Backfill no rows for existing flags; absence of rules preserves current rollout/static behavior.
3. Add audit enum/resource values for targeting rules.
4. Update seed data to create representative rules idempotently.
5. Rollback removes the table and code paths; existing evaluation behavior remains compatible when no rules exist.

## Open Questions

- Should multi-condition `AND` rules be added as a dedicated follow-up before segments, or should segments cover most multi-condition use cases?
- Should future explicit user targeting be modeled as specialized rules or a separate allowlist/denylist capability?
