## Context

FlagForge is planned as a self-hosted feature flag platform with a React dashboard, NestJS API, PostgreSQL persistence, optional Redis caching, SDK evaluation APIs, audit logging, and future real-time updates. The repository currently contains project context only, so this change creates the baseline development structure.

The preferred layout is intentionally simple:

```text
FlagForge/
├── frontend/
└── backend/
```

Both applications will be managed by pnpm workspaces from the repository root. The frontend must follow the `LLM_CONTEXT.md` convention of splitting source code into `core/`, `infrastructure/`, and `presentation/`. The backend should be organized around NestJS modules and CQRS command/query handlers.

## Goals / Non-Goals

**Goals:**

- Establish a runnable pnpm workspace with separate `frontend/` and `backend/` packages.
- Bootstrap `frontend/` as a Vite React TypeScript app with Tailwind CSS, TanStack Query, and React Router.
- Bootstrap `backend/` as a NestJS TypeScript API with CQRS support and TypeORM configured for PostgreSQL.
- Provide local PostgreSQL infrastructure through Docker Compose.
- Add baseline scripts and environment examples for local development.
- Create source folder boundaries that future changes can extend without reorganizing the repository.

**Non-Goals:**

- Implement authentication flows.
- Implement feature flag CRUD, evaluation, targeting, SDK keys, audit logs, analytics, Redis caching, WebSockets, or SDK packages.
- Add production deployment infrastructure.
- Add a separate shared package until there is a concrete need for cross-app contracts.

## Decisions

### Use a two-app pnpm workspace

The root workspace will include only:

```yaml
packages:
  - "frontend"
  - "backend"
```

Rationale: this matches the requested folder layout and keeps the project easy to understand at the start. A future `packages/` directory can be introduced when shared types or SDK packages become real deliverables.

Alternative considered: a larger monorepo with `apps/` and `packages/`. That layout is useful later, but it adds structure before the project has multiple reusable packages.

### Use NestJS CQRS in the backend

The backend will include `@nestjs/cqrs` and organize state-changing operations as commands and read operations as queries where the domain benefits from explicit use cases.

Rationale: feature flag management naturally has auditable commands such as creating flags, toggling environments, rotating SDK keys, and updating rollout settings. CQRS also keeps future evaluation queries distinct from management writes.

Alternative considered: plain controller-service modules. That is simpler, but it would likely need refactoring once audit logging, optimistic locking, and domain workflows are added.

### Use TypeORM with PostgreSQL

The backend will use TypeORM with PostgreSQL as the persistent database.

Rationale: the user requested TypeORM, and the domain needs relational constraints for organizations, users, projects, environments, flags, environment configs, SDK keys, and audit logs.

Alternative considered: Prisma. The README mentions Prisma as a possible preference, but the selected stack for this change is TypeORM.

### Keep Redis out of the foundation change

This change will not add Redis dependencies or services yet.

Rationale: Redis matters for cached evaluation, pub/sub, WebSockets, and background analytics later. Adding it before the core API exists increases setup surface without immediate value.

Alternative considered: include Redis in Docker Compose immediately. This is acceptable later, but Postgres is the only required data service for the foundation.

### Follow the frontend architecture from LLM_CONTEXT.md

The frontend source tree will be organized as:

```text
frontend/src/
├── core/
├── infrastructure/
└── presentation/
```

Rationale: this preserves stable domain types separately from transport APIs, TanStack Query hooks, use cases, route containers, feature hooks, and UI components.

Alternative considered: default Vite flat structure. That is faster to generate but conflicts with the project-specific architecture guidance.

### Configure React Router in the foundation

The frontend will include React Router during bootstrap and mount the app through a router provider.

Rationale: the dashboard will need project, flag, environment, segment, audit, team, and settings routes. Adding routing now makes the shell and future page containers easier to place without reworking the application root.

Alternative considered: wait for the first dashboard route. That would reduce the initial dependency surface slightly, but route structure is already central to the planned dashboard.

### Use Jest as the backend baseline test runner

The backend will include Jest configuration at foundation time.

Rationale: NestJS defaults to Jest, and the backend will need unit tests for CQRS handlers, guards, services, and the future evaluation engine. Integration test setup can be expanded when entities and repositories are introduced.

Alternative considered: defer all test setup. That would make the first feature changes faster, but it weakens the baseline verification contract.

## Risks / Trade-offs

- Workspace scripts may drift between apps -> define root scripts that delegate to `frontend` and `backend`.
- CQRS may feel verbose early -> use it for meaningful application operations while keeping health/bootstrap code simple.
- Early route setup can feel empty -> add a minimal dashboard/home route and leave domain routes for later changes.
- Jest will start with limited coverage -> add baseline tests now and expand integration tests when persistence logic exists.
- TypeORM configuration can become environment-sensitive -> centralize config and provide `.env.example`.
- Avoiding a shared package may cause duplicate types later -> introduce `packages/shared` only when frontend/backend contracts stabilize.
- Docker Compose with only Postgres will need expansion later -> add Redis and workers in dedicated future changes.

## Migration Plan

This is the first application foundation, so no data migration is required.

Implementation can proceed by creating the workspace files, bootstrapping the frontend and backend, adding Postgres Docker Compose configuration, and verifying that both apps build or start in development mode.

Rollback is straightforward: remove the new workspace files, `frontend/`, `backend/`, and Docker Compose additions.

## Open Questions

- None.
