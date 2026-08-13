## Why

FlagForge can now configure and evaluate flags from applications, but teams have no visibility into how flags are used after rollout. Analytics closes that loop by recording SDK evaluation activity and surfacing basic project, environment, and flag metrics in the dashboard.

## What Changes

- Record SDK evaluation activity for single-flag and all-flags evaluation requests.
- Store evaluation events in PostgreSQL with bounded, queryable metadata.
- Provide authenticated analytics read APIs for project/environment/flag summaries.
- Add dashboard analytics views showing evaluation volume, true/false split, top flags, and recent time buckets.
- Keep analytics collection best-effort so it does not break or materially slow SDK evaluation responses.
- Add local seed/demo behavior or generated data only where useful for dashboard verification.

No SDK API changes are required in this scope.

## Capabilities

### New Capabilities

- `analytics-management`: Defines evaluation event recording, aggregation, analytics read APIs, retention assumptions, and dashboard metrics behavior.

### Modified Capabilities

- `flag-evaluation-api`: Evaluation endpoints record analytics after successful SDK authentication and evaluation.
- `dashboard-ui-foundation`: Dashboard provides token-driven analytics navigation and metric views.

## Impact

- Adds backend analytics module, TypeORM entity/migration, service, controller, DTOs, and tests.
- Updates evaluation flow to enqueue or record best-effort analytics events.
- Adds dashboard analytics route, hooks, API client, types, and compact metric UI.
- Updates README, LLM context, and roadmap with analytics behavior and limitations.
