## Why

FlagForge now supports real flag configuration and SDK evaluation, but management changes are not traceable. Audit logs are needed before rollout and targeting features make changes higher impact and harder to reason about after the fact.

## What Changes

- Add organization-scoped audit event persistence.
- Record who performed important management operations, what resource changed, old/new values where practical, request IP metadata, and timestamp.
- Emit audit events for project, environment, feature flag, environment flag config, and SDK key management operations.
- Add authenticated audit log listing API with filtering by project, resource type, action, and pagination.
- Enable dashboard Audit navigation with a dense audit log surface.
- Seed local demo data with representative audit events if needed for dashboard testing.
- Keep analytics, evaluation-event ingestion, Redis, realtime audit streaming, and advanced RBAC out of scope for this change.

## Capabilities

### New Capabilities

- `audit-log-management`: Organization-scoped audit event persistence, management API listing, event emission, and dashboard audit log viewing.

### Modified Capabilities

- `project-management`: Project create/update/delete operations emit audit events.
- `environment-management`: Environment update operations emit audit events.
- `feature-flag-management`: Feature flag create/update/delete and per-environment config changes emit audit events.
- `sdk-key-management`: SDK key create/revoke operations emit audit events.
- `dashboard-ui-foundation`: Audit navigation becomes enabled and renders a token-driven, responsive audit log screen.

## Impact

- Backend: `backend/src/audit`, TypeORM entity/migration, audit service/controller, DTOs, module wiring, and Jest tests.
- Existing backend services: project, environment, feature flag, and SDK key services gain audit event recording after successful mutations.
- Frontend: audit domain types, API calls, TanStack Query hooks, use-case orchestration, route container, presentation hook, and dashboard components.
- Data: PostgreSQL `audit_logs` table with organization, actor, action, resource, old/new value JSON, IP address, and timestamps.
- Docs: README endpoint list/demo notes and roadmap status updates.
