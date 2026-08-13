## Why

FlagForge can manage organizations, projects, and environments, but it cannot yet model the core product object: a feature flag. Adding boolean feature flags completes the next Management Core slice and gives the dashboard a real flag workflow before SDK evaluation work begins.

## What Changes

- Add project-scoped boolean feature flag management for authenticated users.
- Add per-environment boolean configuration for each flag, including enabled state and served boolean value.
- Create default per-environment flag configuration when a flag is created.
- Expose management API endpoints for listing, creating, reading, updating, deleting, and configuring boolean flags.
- Add dashboard routes and UI for project flag list, flag creation/editing, and per-environment toggle/configuration rows.
- Seed the local demo project with example boolean flags and environment configurations.
- Keep evaluation API, SDK keys, targeting rules, percentage rollouts, and analytics out of scope for this change.

## Capabilities

### New Capabilities

- `feature-flag-management`: Project-scoped boolean feature flags and per-environment dashboard/API management.

### Modified Capabilities

- `dashboard-ui-foundation`: Enable and exercise the existing Flags navigation entry with real flag management screens.

## Impact

- Backend: `backend/src/feature-flags`, TypeORM entities, migration, DTOs, controllers, services, module wiring, and Jest tests.
- Frontend: `frontend/src/core/types/FeatureFlag`, API calls, TanStack Query hooks, use-case orchestration, route containers, presentation hooks, and dashboard components.
- Data: PostgreSQL tables for feature flags and environment flag configurations, plus idempotent seed updates.
- Docs: README/demo flow and roadmap status updates if the local workflow changes.
