## Why

FlagForge needs a concrete project foundation before feature work can begin. The README defines a broad feature flag platform, but the repository currently has no runnable frontend or backend structure.

This change establishes the initial full-stack workspace using the chosen stack and the preferred simple folder layout: one `frontend/` application and one `backend/` application.

## What Changes

- Add a pnpm workspace at the repository root.
- Add a `frontend/` Vite React application foundation using TypeScript, TanStack Query, Tailwind CSS, and the `src/core`, `src/infrastructure`, and `src/presentation` structure from `LLM_CONTEXT.md`.
- Add a `backend/` NestJS API foundation using TypeScript, CQRS, TypeORM, and PostgreSQL configuration.
- Add local development infrastructure for PostgreSQL through Docker Compose.
- Add root scripts for installing, developing, building, linting, and testing the workspace.
- Add baseline environment example files and project documentation for local setup.
- Establish early domain module boundaries for authentication, organizations, projects, environments, feature flags, evaluations, SDK keys, audit, and common backend utilities.

## Capabilities

### New Capabilities

- `platform-foundation`: Defines the baseline repository structure, workspace conventions, development commands, and app bootstrapping requirements for the FlagForge platform.

### Modified Capabilities

- None.

## Impact

- Affects repository layout by introducing `frontend/` and `backend/` as workspace packages.
- Adds TypeScript, pnpm workspace configuration, NestJS, Vite React, TanStack Query, Tailwind CSS, TypeORM, and PostgreSQL development dependencies.
- Adds Docker Compose support for local PostgreSQL.
- Creates the foundation that future feature flag, authentication, evaluation, and dashboard changes will build on.
