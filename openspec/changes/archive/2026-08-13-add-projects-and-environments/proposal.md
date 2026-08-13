## Why

FlagForge has authentication and organization ownership, but users still cannot create the product hierarchy that feature flags depend on. Projects and environments are the next management-core layer because flags, SDK keys, rollout rules, and evaluation APIs need a scoped project/environment boundary.

## What Changes

- Add organization-scoped project management for authenticated users.
- Add default environment creation for new projects.
- Add environment listing and basic environment management within a project.
- Add protected backend APIs for project and environment workflows.
- Add dashboard screens for project list/create and project detail environment management.
- Update local seed data so the demo account has a sample project and default environments.
- Keep feature flag creation, SDK keys, and evaluation APIs out of this change.

## Capabilities

### New Capabilities

- `project-management`: Organization-scoped project creation, listing, lookup, update, and deletion.
- `environment-management`: Project-scoped environments, default environment creation, environment listing, and basic environment updates.

### Modified Capabilities

- None.

## Impact

- Backend: new project and environment modules, entities, migrations, DTOs, services, controllers, and tests.
- Frontend: project and environment domain types, API calls, TanStack Query hooks, use-case orchestration, routes, containers, presentation hooks, and dashboard UI components.
- Database: new `projects` and `environments` tables scoped through organization/project relationships.
- Seed data: demo organization receives one project with Development, Staging, and Production environments.
- Documentation: README and roadmap should include the new local API/dashboard workflow once implemented.
