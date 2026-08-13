## Why

FlagForge can currently serve static boolean values and deterministic percentage rollouts, but administrators cannot target specific users or cohorts by request attributes. Targeting rules are the next step because they make evaluations useful for controlled releases, allowlists, customer plans, and country-specific behavior before reusable segments are introduced.

## What Changes

- Add environment-scoped targeting rules for boolean flag configurations.
- Support ordered rules with first-match-wins evaluation before percentage rollout fallback.
- Support the README MVP attribute operators: `EQUALS`, `NOT_EQUALS`, `CONTAINS`, `NOT_CONTAINS`, `STARTS_WITH`, `ENDS_WITH`, `IN`, `NOT_IN`, `GREATER_THAN`, `GREATER_THAN_OR_EQUAL`, `LESS_THAN`, and `LESS_THAN_OR_EQUAL`.
- Add management APIs to list, create, update, delete, and reorder rules for a feature flag environment configuration.
- Add dashboard UI for managing rules with React Final Form, Zod validation, shared common controls, and token-driven styling.
- Add audit events for targeting rule creation, update, deletion, and reorder.
- Update SDK evaluation so context attributes can satisfy targeting rules before rollout logic.
- Leave reusable segments and multi-condition rule groups out of scope for this change.

## Capabilities

### New Capabilities

- `targeting-rule-management`: Environment-scoped targeting rule persistence, management APIs, ordering, validation, operator semantics, and audit behavior.

### Modified Capabilities

- `flag-evaluation-api`: SDK evaluation applies ordered targeting rules before percentage rollout and returns targeting reason metadata.
- `dashboard-ui-foundation`: Dashboard flag detail screens expose compact, responsive targeting rule management using shared UI primitives.
- `audit-log-management`: Audit logs capture targeting rule mutations and allow filtering by the new targeting rule resource/action metadata.
- `feature-flag-management`: Demo seed and feature flag detail behavior include representative targeting rules for local testing.

## Impact

- Backend: NestJS CQRS handlers, TypeORM entity and migration, validation DTOs, feature flag/evaluation integration, audit metadata enums, seed script, Jest coverage.
- Frontend: domain types, API client functions, TanStack Query hooks, use-case orchestration, flag detail presentation components, common form controls where needed, responsive dashboard styling.
- API: authenticated management endpoints for environment flag targeting rules, plus SDK evaluation behavior changes for existing evaluation endpoints.
- Docs/OpenSpec: README/LLM context/roadmap updates as needed to keep future changes aligned with the targeting model.
