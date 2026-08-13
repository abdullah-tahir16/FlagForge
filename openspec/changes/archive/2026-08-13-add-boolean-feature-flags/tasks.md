## 1. Documentation and Planning Alignment

- [x] 1.1 Read `LLM_CONTEXT.md`, the archived dashboard UI foundation artifacts, and current project/environment specs before implementation.
- [x] 1.2 Update `docs/ROADMAP.md` so `enhance-dashboard-ui-foundation` is archived and `add-boolean-feature-flags` is active.
- [x] 1.3 Update `README.md` demo workflow and endpoint list if flag management routes or seed data change local usage.

## 2. Backend Data Model and Migration

- [x] 2.1 Add feature flag type enum and `FeatureFlag` TypeORM entity scoped to projects.
- [x] 2.2 Add `EnvironmentFlagConfig` TypeORM entity scoped to feature flags and environments.
- [x] 2.3 Add project, feature flag, and environment relationships with cascade behavior matching the design.
- [x] 2.4 Add migration for `feature_flags` and `environment_flag_configs` tables, indexes, unique constraints, and foreign keys.
- [x] 2.5 Register new entities in TypeORM configuration and `FeatureFlagsModule`.

## 3. Backend API and Domain Behavior

- [x] 3.1 Add DTOs for create feature flag, update feature flag, update environment flag config, and feature flag responses.
- [x] 3.2 Implement project-scoped feature flag create with key generation, duplicate-key rejection, and atomic default config creation.
- [x] 3.3 Implement project-scoped list and detail queries returning environment configurations in environment sort order.
- [x] 3.4 Implement project-scoped metadata update while keeping flag keys stable.
- [x] 3.5 Implement project-scoped feature flag delete with config cleanup.
- [x] 3.6 Implement environment config update for `enabled` and boolean `value` with environment/project ownership checks.
- [x] 3.7 Add authenticated controller routes under `/api/v1/projects/:projectId/flags`.
- [x] 3.8 Extend the idempotent seed script with demo boolean flags and environment configurations.

## 4. Backend Tests

- [x] 4.1 Add service tests for create/list/detail/update/delete feature flag behavior.
- [x] 4.2 Add service tests for default environment config creation and atomic rollback assumptions.
- [x] 4.3 Add service tests for duplicate keys, cross-organization access, and environment mismatch rejection.
- [x] 4.4 Add controller tests for route wiring, auth guard usage, and DTO response shapes.

## 5. Frontend Domain and API Layer

- [x] 5.1 Add `core/types/FeatureFlag` types for feature flags, environment configs, and inputs.
- [x] 5.2 Add `infrastructure/api/FeatureFlag` API functions and transport DTO types.
- [x] 5.3 Add TanStack Query hooks for list, detail, create, update, delete, and environment config update.
- [x] 5.4 Add `useFeatureFlagUseCase` orchestration with query invalidation and mutation state.
- [x] 5.5 Add Zod validation schemas for feature flag create/edit forms and boolean environment config updates.

## 6. Frontend Routes and Dashboard Integration

- [x] 6.1 Enable the Flags app-shell navigation item and active-state matching for `/flags` and project flag routes.
- [x] 6.2 Add `/flags` route as a project-aware entry point using existing dashboard primitives.
- [x] 6.3 Add `/projects/:projectId/flags` route for project flag list, create surface, empty/loading/error states, and destructive confirmation.
- [x] 6.4 Add `/projects/:projectId/flags/:flagId` route for flag metadata editing and per-environment boolean config rows.
- [x] 6.5 Add a project-detail action linking to the selected project's flags.
- [x] 6.6 Use `PageHeader`, `Toolbar`, `Badge`, `Alert`, `EmptyState`, `Skeleton`, `ConfirmDialog`, `DataList`, and `DataRow` consistently.

## 7. Frontend UX and Accessibility

- [x] 7.1 Ensure flag create/edit forms use React Final Form and Zod validation wrappers.
- [x] 7.2 Ensure boolean config rows have clear toggles/controls for enabled state and served boolean value.
- [x] 7.3 Ensure delete, save, loading, disabled, error, empty, hover, active, and focus states are visible and token-driven.
- [x] 7.4 Verify mobile 375px layout for `/flags`, project flag list, and flag detail.
- [x] 7.5 Verify desktop 1024px and 1440px layouts for shell navigation, flag list density, and flag detail environment rows.
- [x] 7.6 Scan presentation code for raw palette utilities and browser `confirm`/`alert`/`prompt` usage.

## 8. Final Verification

- [x] 8.1 Run `corepack pnpm --filter @flagforge/backend test`.
- [x] 8.2 Run `corepack pnpm --filter @flagforge/frontend build`.
- [x] 8.3 Run root `corepack pnpm build`, `corepack pnpm test`, and `corepack pnpm lint`.
- [x] 8.4 Run `pnpm seed` and verify demo login can see seeded flags.
- [x] 8.5 Run OpenSpec status/apply checks for `add-boolean-feature-flags`.
- [x] 8.6 Run `openspec validate add-boolean-feature-flags --strict`.
