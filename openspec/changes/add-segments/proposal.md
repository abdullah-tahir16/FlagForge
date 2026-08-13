## Why

Targeting rules now let a single flag target users by attributes, but repeated cohorts such as Premium Italian Users or Internal Employees would need to be duplicated across flags and environments. Segments solve that duplication by making reusable project-scoped groups that can be referenced during flag evaluation.

## What Changes

- Add project-scoped segment management with name, key, description, match mode, and ordered segment conditions.
- Support `MATCH_ALL` and `MATCH_ANY` segment condition evaluation using the existing targeting rule operator semantics.
- Add management APIs to list, create, read, update, delete, and manage segment conditions for a project.
- Extend environment flag targeting so ordered targeting rules can reference a reusable segment and return a boolean result when the evaluation context belongs to that segment.
- Update SDK evaluation so segment-targeting rules participate in first-match evaluation before ordinary attribute targeting and percentage rollout fallback.
- Add dashboard UI for managing segments and for choosing a segment in flag targeting rule workflows.
- Add audit events for segment and segment condition mutations.
- Add representative local demo segments and seed references to make the workflow visible after `pnpm seed`.
- Leave nested segments, segment versioning, import/export, and per-environment segment overrides out of scope.

## Capabilities

### New Capabilities

- `segment-management`: Project-scoped reusable segment CRUD, condition management, match mode behavior, validation, and audit behavior.

### Modified Capabilities

- `targeting-rule-management`: Targeting rules can reference project segments as a condition source in addition to direct attributes.
- `flag-evaluation-api`: SDK evaluation applies segment-targeting rules before ordinary attribute rules and rollout fallback.
- `dashboard-ui-foundation`: Dashboard exposes segment management and segment selection within flag targeting workflows.
- `audit-log-management`: Audit logs capture segment and segment condition mutations and allow filtering by segment resource/action metadata.
- `feature-flag-management`: Demo seed includes representative segments and segment references for local testing.

## Impact

- Backend: NestJS segment module, CQRS handlers, TypeORM entities/migrations, segment matcher reuse, targeting rule extension, evaluation query changes, audit enum/resource values, seed updates, Jest coverage.
- Frontend: segment domain types, API functions, TanStack Query hooks, use-case orchestration, dashboard segment route/components, and targeting rule form updates.
- API: authenticated segment management endpoints plus updated targeting rule request/response shapes for segment references.
- Docs/OpenSpec: README, LLM context, roadmap, and main specs updated when the change is archived.
