## 1. Documentation and Planning Alignment

- [x] 1.1 Read `LLM_CONTEXT.md`, archived SDK/evaluation artifacts, README audit sections, and current management specs before implementation.
- [x] 1.2 Update `docs/ROADMAP.md` so `add-sdk-keys-and-evaluation-api` is archived and `add-audit-logs` is active.
- [x] 1.3 Update `README.md` local workflow and endpoint list when audit API or demo behavior changes local usage.

## 2. Backend Audit Data Model

- [x] 2.1 Add audit action and resource type enums.
- [x] 2.2 Add `AuditLog` TypeORM entity scoped to organizations.
- [x] 2.3 Add migration for `audit_logs` table, JSONB old/new values, indexes, and foreign keys where appropriate.
- [x] 2.4 Register the audit entity in TypeORM configuration and `AuditModule`.
- [x] 2.5 Add shared `AuditContext` and safe audit snapshot helper types.

## 3. Backend Audit Service and API

- [x] 3.1 Add DTOs for audit log response and list filters/pagination.
- [x] 3.2 Implement `AuditService.record` for safe audit event persistence.
- [x] 3.3 Implement organization-scoped audit list query ordered newest first.
- [x] 3.4 Implement filters for project id, environment id, resource type, and action.
- [x] 3.5 Implement pagination with bounded limits and next-page metadata.
- [x] 3.6 Add authenticated `GET /api/v1/audit` controller route.
- [x] 3.7 Ensure audit responses never expose sensitive secrets, hashes, tokens, or cookies.

## 4. Backend Event Emission Integration

- [x] 4.1 Pass request IP audit context from mutating project, environment, feature flag, and SDK key controllers.
- [x] 4.2 Emit project create/update/delete audit events after successful project mutations.
- [x] 4.3 Emit environment update audit events after successful environment mutations.
- [x] 4.4 Emit feature flag create/update/delete audit events after successful feature flag mutations.
- [x] 4.5 Emit feature flag environment config update audit events with old/new enabled/value snapshots.
- [x] 4.6 Emit SDK key create/revoke audit events without storing raw SDK key secrets.
- [x] 4.7 Preserve existing organization isolation and mutation behavior when audit event recording succeeds.

## 5. Backend Tests and Seed Data

- [x] 5.1 Add audit service tests for record, list, filtering, pagination, and organization isolation.
- [x] 5.2 Add audit controller tests for route wiring, auth guard usage, filter forwarding, and response shape.
- [x] 5.3 Add project service tests or update existing tests for project audit emission.
- [x] 5.4 Add environment service tests or update existing tests for environment audit emission.
- [x] 5.5 Add feature flag service tests or update existing tests for feature flag and config audit emission.
- [x] 5.6 Add SDK key service tests or update existing tests for create/revoke audit emission.
- [x] 5.7 Extend local seed/demo workflow with representative audit entries or mutations that create visible entries.

## 6. Frontend Audit Domain and API Layer

- [x] 6.1 Add `core/types/Audit` types for audit events, actions, resource types, filters, and pagination.
- [x] 6.2 Add `infrastructure/api/Audit` API functions and transport DTO types.
- [x] 6.3 Add TanStack Query hook for audit log listing.
- [x] 6.4 Add `useAuditUseCase` orchestration for filters, pagination, and query state.
- [x] 6.5 Add route-level presentation hook state for audit filters and pagination controls.

## 7. Frontend Audit Dashboard UX

- [x] 7.1 Enable the Audit app-shell navigation item and active-state matching for `/audit`.
- [x] 7.2 Add `/audit` route inside the shared dashboard shell.
- [x] 7.3 Add audit log screen using a dense timeline/table surface with action, resource, actor, context, and timestamp.
- [x] 7.4 Add token-driven filter controls for project id, resource type, and action.
- [x] 7.5 Add loading, error, empty, and paginated states using shared primitives.
- [x] 7.6 Use `PageHeader`, `Toolbar`, `Badge`, `Alert`, `EmptyState`, `Skeleton`, `DataList`, and `DataRow` consistently where applicable.

## 8. Frontend Accessibility and Responsive Verification

- [x] 8.1 Ensure audit filters, rows, pagination, hover, active, disabled, and focus states are visible and token-driven.
- [x] 8.2 Ensure audit action and resource states do not rely on color alone.
- [x] 8.3 Verify 375px layout for the audit route.
- [x] 8.4 Verify 1024px and 1440px layouts for audit filters, rows, and pagination.
- [x] 8.5 Scan presentation code for raw palette utilities and browser `confirm`/`alert`/`prompt` usage.

## 9. Final Verification

- [x] 9.1 Run `corepack pnpm --filter @flagforge/backend test`.
- [x] 9.2 Run `corepack pnpm --filter @flagforge/frontend build`.
- [x] 9.3 Run root `corepack pnpm build`, `corepack pnpm test`, and `corepack pnpm lint`.
- [x] 9.4 Run `pnpm seed` and verify the demo workflow can show audit entries.
- [x] 9.5 Verify `GET /api/v1/audit` with demo login and filters.
- [x] 9.6 Run OpenSpec status/apply checks for `add-audit-logs`.
- [x] 9.7 Run `openspec validate add-audit-logs --strict`.
