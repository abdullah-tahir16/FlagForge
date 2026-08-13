## 1. Backend Data Model

- [x] 1.1 Create `Project` entity with id, organization id, name, key, optional description, timestamps, organization relation, and environment relation.
- [x] 1.2 Create `Environment` entity with id, project id, name, key, sort order, timestamps, and project relation.
- [x] 1.3 Add TypeORM migration for `projects` with per-organization unique project key constraint and organization foreign key.
- [x] 1.4 Add TypeORM migration for `environments` with per-project unique environment key constraint, sort order index, and project foreign key.
- [x] 1.5 Add modules for projects and environments using NestJS module boundaries.

## 2. Backend Project Management

- [x] 2.1 Add project DTOs for create, update, and response payloads.
- [x] 2.2 Implement project creation scoped to authenticated organization.
- [x] 2.3 Create Development, Staging, and Production environments transactionally during project creation.
- [x] 2.4 Implement organization-scoped project list and project detail lookup.
- [x] 2.5 Implement project update while keeping project keys stable after rename.
- [x] 2.6 Implement project deletion with environment cascade behavior.
- [x] 2.7 Add protected project controller endpoints under `/api/v1/projects`.
- [x] 2.8 Ensure cross-organization project access is rejected or hidden as not found.

## 3. Backend Environment Management

- [x] 3.1 Add environment DTOs for update and response payloads.
- [x] 3.2 Implement project-scoped environment listing ordered by sort order.
- [x] 3.3 Implement environment update while keeping environment keys stable after rename.
- [x] 3.4 Add protected environment endpoints nested under project routes.
- [x] 3.5 Ensure cross-organization environment access is rejected or hidden as not found.

## 4. Backend Tests

- [x] 4.1 Add tests for project creation with default environments.
- [x] 4.2 Add tests for duplicate project key rejection within the same organization.
- [x] 4.3 Add tests for project list/detail scoping by organization.
- [x] 4.4 Add tests for project update preserving key stability.
- [x] 4.5 Add tests for project deletion removing project-scoped environments.
- [x] 4.6 Add tests for environment listing order.
- [x] 4.7 Add tests for environment update preserving key stability.
- [x] 4.8 Add tests for cross-organization project and environment access rejection.

## 5. Frontend Domain and API

- [x] 5.1 Add frontend core project and environment types with re-exports.
- [x] 5.2 Add pure project API calls and transport types.
- [x] 5.3 Add pure environment API calls and transport types.
- [x] 5.4 Add TanStack Query hooks/mutations for project list, detail, create, update, delete, environment list, and environment update.
- [x] 5.5 Add project/environment use-case orchestration hooks.

## 6. Frontend Dashboard Routes and UI

- [x] 6.1 Add protected `/projects` and `/projects/:projectId` routes.
- [x] 6.2 Add project list route container and presentation hook.
- [x] 6.3 Add project detail route container and presentation hook.
- [x] 6.4 Add reusable project create/edit form using React Final Form and Zod validation.
- [x] 6.5 Add environment edit form or inline edit behavior using React Final Form and Zod validation.
- [x] 6.6 Add project dashboard components using common controls and semantic theme tokens.
- [x] 6.7 Update app shell navigation so authenticated users can reach project routes.
- [x] 6.8 Ensure loading, empty, error, and delete states are visible and responsive.

## 7. Seed Data and Documentation

- [x] 7.1 Update `pnpm seed` to create or update a demo project for `user@example.com`.
- [x] 7.2 Update `pnpm seed` to ensure the demo project has Development, Staging, and Production environments.
- [x] 7.3 Update README with project and environment API endpoints and demo workflow.
- [x] 7.4 Update roadmap status for `add-projects-and-environments`.

## 8. Verification

- [x] 8.1 Run database migrations against local PostgreSQL.
- [x] 8.2 Run backend tests.
- [x] 8.3 Run frontend build or static checks.
- [x] 8.4 Run root workspace build, test, and lint commands.
- [x] 8.5 Run OpenSpec status/apply checks for `add-projects-and-environments`.
