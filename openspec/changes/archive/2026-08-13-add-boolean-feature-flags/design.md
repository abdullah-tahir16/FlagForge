## Context

FlagForge currently supports authenticated organizations, projects, default environments, and a dashboard shell with shared UI primitives. The backend has a placeholder `feature-flags` module, but no persisted flag model or management API. The frontend has project list/detail routes and a disabled Flags navigation item.

This change adds the first real flag workflow: boolean feature flags scoped to projects, with per-environment configuration. It must fit the existing pnpm workspace, NestJS/TypeORM/Postgres backend, React Router/TanStack Query frontend, React Final Form/Zod forms, and dashboard token/UI rules from `LLM_CONTEXT.md`.

## Goals / Non-Goals

**Goals:**

- Persist boolean feature flags under projects and protect them through organization ownership.
- Persist per-environment boolean configuration for each flag.
- Create default environment configs atomically when a flag is created.
- Provide authenticated management endpoints for flag CRUD and environment config updates.
- Enable dashboard flag workflows from project detail and the main Flags navigation entry.
- Add seed data, docs, and tests so the local demo shows feature flag management.

**Non-Goals:**

- SDK key management and public evaluation endpoints.
- Percentage rollouts, targeting rules, segments, or prerequisites.
- Audit log persistence for flag changes.
- Multi-variant flags or typed flag values beyond boolean.
- Realtime flag updates or Redis caching.

## Decisions

### Store flag identity separately from environment configuration

Use two tables:

- `feature_flags`: `id`, `project_id`, `name`, `key`, `description`, `type`, timestamps.
- `environment_flag_configs`: `id`, `feature_flag_id`, `environment_id`, `enabled`, `value`, timestamps.

`feature_flags` owns stable project-scoped metadata. `environment_flag_configs` owns deploy-time state for each environment.

Alternative considered: store all environment values in a JSON column on the flag. That would be quicker to render, but it weakens relational integrity, makes environment deletion harder, and complicates future evaluation queries.

### Limit type support to boolean while leaving a type column

Set `type` to `BOOLEAN` for all flags in this change. Keep the type explicit in API responses and database rows so future string/number/json flags can extend the same model without renaming the concept.

Alternative considered: omit `type` until variants exist. That is simpler now, but it makes the first type expansion a harder migration and creates ambiguous API semantics.

### Generate stable flag keys from names

Use the existing `createKeyFromName` helper for new flag keys. Enforce uniqueness on `(project_id, key)`. Renaming a flag changes the display name and description but does not change the key.

Alternative considered: editable keys. That is useful later, but key changes affect SDK consumers and should be a dedicated UX/API decision.

### Create per-environment configs in the flag creation transaction

When a user creates a flag, load environments for that project and create one config per environment in the same transaction as the flag. Default config values:

- `enabled: false`
- `value: false`

If config creation fails, the flag creation rolls back.

Alternative considered: lazy config creation when a flag detail page loads. That hides consistency issues and makes later evaluation behavior harder to reason about.

### API route shape follows project hierarchy

Use authenticated management routes:

- `GET /api/v1/projects/:projectId/flags`
- `POST /api/v1/projects/:projectId/flags`
- `GET /api/v1/projects/:projectId/flags/:flagId`
- `PATCH /api/v1/projects/:projectId/flags/:flagId`
- `DELETE /api/v1/projects/:projectId/flags/:flagId`
- `PATCH /api/v1/projects/:projectId/flags/:flagId/environments/:environmentId`

All routes verify the project belongs to the current user's organization. Config update also verifies the environment belongs to the same project and the config belongs to the selected flag.

Alternative considered: top-level `/feature-flags/:flagId` routes. Project hierarchy is more verbose but keeps authorization and frontend cache keys aligned with the current project model.

### Dashboard routes are project-first, with a global Flags entry as an index

Add:

- `/flags`: project-aware entry screen listing projects or recent project flag links.
- `/projects/:projectId/flags`
- `/projects/:projectId/flags/:flagId`

Project detail should link to the flag list for that project. The app shell Flags nav becomes enabled and active for `/flags` and project flag routes.

Alternative considered: only nest flags under project detail. That would keep routing small but leaves the shell's Flags navigation unused and makes future cross-project flag workflows harder.

### Frontend follows existing domain layering

Add `FeatureFlag` folders in `core/types`, `infrastructure/api`, `infrastructure/hooks`, `infrastructure/useCases`, `presentation/hooks`, `presentation/containers`, and `presentation/components`. Use one TanStack Query hook/mutation per operation. Use React Final Form with Zod schemas for create/edit forms. Use common dashboard primitives and theme tokens only.

### Seed data is idempotent

Extend `pnpm seed` so the demo project contains useful flags such as `new-checkout` and `beta-navigation`. Rerunning the seed should repair names/configuration and avoid duplicates.

## Risks / Trade-offs

- Migration ordering can fail if entities reference projects/environments incorrectly -> include explicit migration and add entities to TypeORM module registration.
- Cascading deletes can remove configs unexpectedly if relationships are wrong -> use database foreign keys with `onDelete: CASCADE` from project to flags and from flags/environments to configs.
- Cross-organization access bugs are high impact -> centralize project lookup through existing `ProjectsService.findProjectForUser` and cover not-found cases in tests.
- Flag keys are immutable after creation -> document this behavior in tests/UI and leave editable keys for a later change.
- The `/flags` route may be thin at first -> keep it useful as a project/flag entry point without inventing cross-project search before requirements exist.
