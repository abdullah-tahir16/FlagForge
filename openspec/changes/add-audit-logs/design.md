## Context

FlagForge now has authenticated management workflows for projects, environments, boolean feature flags, SDK keys, and public SDK evaluation. The backend already has an empty `AuditModule`, and the dashboard shell includes a disabled Audit navigation item.

Audit logs are cross-cutting: several domain services must record events, but the query/read surface should remain centralized. This change must preserve the existing pnpm workspace, NestJS/TypeORM/Postgres backend, React Router/TanStack Query frontend, React Final Form/Zod forms, and dashboard token/UI rules from `LLM_CONTEXT.md`.

## Goals / Non-Goals

**Goals:**

- Persist organization-scoped audit events for important management mutations.
- Store actor, action, resource type/id, project/environment context where available, old/new values where practical, IP address, and timestamp.
- Emit audit events only after successful mutations.
- Keep audit write failures from breaking core management workflows where practical, while still making failures test-visible.
- Provide authenticated audit log list API with organization isolation, pagination, and useful filters.
- Enable the dashboard Audit route with a dense, responsive audit log surface.
- Seed representative audit events or ensure local mutation workflows create events for dashboard testing.

**Non-Goals:**

- Evaluation analytics or per-SDK evaluation event ingestion.
- Realtime audit streaming.
- Redis, queues, or async workers.
- Advanced RBAC or member management.
- Full diff visualization for large JSON values.
- Audit retention policies or export.

## Decisions

### Centralize audit persistence in `AuditModule`

Create an `AuditLog` entity and `AuditService` responsible for recording and listing events. Domain services call `auditService.record(...)` after successful mutations.

Alternative considered: database triggers. Triggers can capture raw changes, but they cannot reliably include authenticated actor, request IP, or semantic action names without extra plumbing.

### Use explicit action and resource enums

Use action values such as:

- `PROJECT_CREATED`, `PROJECT_UPDATED`, `PROJECT_DELETED`
- `ENVIRONMENT_UPDATED`
- `FEATURE_FLAG_CREATED`, `FEATURE_FLAG_UPDATED`, `FEATURE_FLAG_DELETED`
- `FEATURE_FLAG_CONFIG_UPDATED`
- `SDK_KEY_CREATED`, `SDK_KEY_REVOKED`

Resource types stay similarly explicit: `PROJECT`, `ENVIRONMENT`, `FEATURE_FLAG`, `ENVIRONMENT_FLAG_CONFIG`, `SDK_KEY`.

Alternative considered: free-form strings. Enums make tests, dashboard filters, and future audit expansion more reliable.

### Include resource context directly on audit rows

Audit rows store:

- `organization_id`
- `actor_user_id`
- `actor_email`
- `action`
- `resource_type`
- `resource_id`
- `project_id`
- `environment_id`
- `resource_name`
- `old_value` JSONB
- `new_value` JSONB
- `ip_address`
- `created_at`

Duplicating names and context keeps the audit timeline useful after resources are renamed or deleted.

Alternative considered: rely only on joins to current tables. That fails for deleted resources and makes historical display misleading after rename.

### Capture request metadata through controllers

Controllers pass a small audit context into mutating service methods:

```text
actor user
request IP
```

Services already receive the authenticated user. Adding IP context at controller boundaries avoids coupling audit service to Express request globals.

Alternative considered: interceptor-based automatic audit. Interceptors are useful later, but current events need old/new values and semantic action names from domain services.

### Keep audit reads organization-scoped

Audit list endpoints stay authenticated and organization-scoped:

- `GET /api/v1/audit`

Filters:

- `projectId`
- `environmentId`
- `resourceType`
- `action`
- `limit`
- `cursor` or page offset

Alternative considered: nest audit under projects only. A top-level route supports a workspace-wide timeline while filters provide project-specific views.

### Dashboard audit screen is a dense timeline/table hybrid

Enable `/audit` in the shared shell. The first UI should prioritize scanning:

- action badge
- resource name/type
- actor
- project/environment metadata
- timestamp
- compact old/new value summary

Alternative considered: add audit panels to every resource page first. A central audit page gives immediate product value and keeps the initial change bounded.

## Risks / Trade-offs

- Audit writes can fail after a domain mutation -> Prefer recording in the same transaction for operations already transactional; otherwise log after save and surface/test failures during development.
- Old/new JSON can grow too large -> Store compact domain snapshots, not entire entity graphs.
- Sensitive data leakage -> Never store raw SDK secrets, password hashes, refresh tokens, JWTs, or httpOnly cookie values in audit payloads.
- Cross-organization leakage -> Always filter audit reads by `organization_id` from the authenticated user.
- Too many service signature changes -> Use a small shared `AuditContext` type to keep call sites consistent.
- Dashboard timeline can become noisy -> Start with filtering and pagination, leave saved views/search for later.

## Migration Plan

1. Add `audit_logs` table and indexes.
2. Implement `AuditModule`, entity, DTOs, service, and controller.
3. Wire audit recording into project, environment, feature flag, config, and SDK key mutation paths.
4. Add backend tests for recording, filtering, organization isolation, and mutation event emission.
5. Add frontend audit route, domain/API/hooks/use-case, and dashboard UI.
6. Update seed/docs and verify local workflows create visible audit entries.

Rollback removes the audit routes and table. Existing management data remains unchanged.

## Open Questions

- Should audit writes be strictly transactional for every mutating operation now, or should non-transactional services record after success and accept rare missing audit rows?
- Should pagination use cursor timestamps from the start, or offset/limit until audit volume grows?
