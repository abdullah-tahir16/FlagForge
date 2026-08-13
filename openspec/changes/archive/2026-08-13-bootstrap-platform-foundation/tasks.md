## 1. Workspace Foundation

- [x] 1.1 Create root `package.json` with pnpm workspace scripts for `dev`, `build`, `lint`, and `test`.
- [x] 1.2 Create `pnpm-workspace.yaml` including only `frontend` and `backend`.
- [x] 1.3 Add root `.gitignore` entries for Node, build output, environment files, and package manager artifacts.
- [x] 1.4 Add root `.env.example` documenting shared local development defaults.

## 2. Backend Bootstrap

- [x] 2.1 Create `backend/` NestJS TypeScript application structure.
- [x] 2.2 Add backend dependencies for NestJS, CQRS, TypeORM, PostgreSQL, validation, configuration, and Jest testing.
- [x] 2.3 Configure NestJS application bootstrap with config loading, validation pipe, CORS, and `/api/v1` global prefix.
- [x] 2.4 Configure TypeORM PostgreSQL connection from environment variables without production schema synchronization.
- [x] 2.5 Add backend module boundaries for `auth`, `users`, `organizations`, `projects`, `environments`, `feature-flags`, `evaluations`, `sdk-keys`, `audit`, and `common`.
- [x] 2.6 Add a health endpoint that verifies the API process is running.
- [x] 2.7 Add backend `.env.example` with required database and server variables.
- [x] 2.8 Configure Jest for backend unit tests and add a baseline health/app test.

## 3. Frontend Bootstrap

- [x] 3.1 Create `frontend/` Vite React TypeScript application structure.
- [x] 3.2 Add frontend dependencies for React, Vite, TanStack Query, Tailwind CSS, Axios, and React Router.
- [x] 3.3 Configure Tailwind CSS and global styles.
- [x] 3.4 Configure TanStack Query provider at the application root.
- [x] 3.5 Configure React Router at the application root with a baseline route.
- [x] 3.6 Create frontend source boundaries under `src/core`, `src/infrastructure`, and `src/presentation`.
- [x] 3.7 Add baseline API client configuration using the frontend environment API base URL.
- [x] 3.8 Add frontend `.env.example` with required Vite variables.

## 4. Local Infrastructure

- [x] 4.1 Add `docker-compose.yml` with a PostgreSQL service for local development.
- [x] 4.2 Ensure Docker Compose credentials and ports match the committed environment examples.
- [x] 4.3 Document local startup steps for installing dependencies, starting Postgres, and running both apps.

## 5. Verification

- [x] 5.1 Run workspace dependency installation with pnpm.
- [x] 5.2 Verify backend build or typecheck succeeds.
- [x] 5.3 Verify frontend build or typecheck succeeds.
- [x] 5.4 Verify backend Jest tests run successfully.
- [x] 5.5 Verify lint or equivalent static checks run for both workspaces.
- [x] 5.6 Run OpenSpec validation/status checks for `bootstrap-platform-foundation`.
