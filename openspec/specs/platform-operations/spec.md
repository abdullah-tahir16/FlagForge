# platform-operations Specification

## Purpose
TBD - created by archiving change add-ci-and-docker-polish. Update Purpose after archive.
## Requirements
### Requirement: Repository verification runs in CI

The system SHALL provide a committed CI workflow that verifies the workspace using the pinned Node and pnpm toolchain.

#### Scenario: CI installs pinned workspace tooling
- **WHEN** the CI workflow runs for a push or pull request
- **THEN** it installs a Node version satisfying the repository engine requirement and activates pnpm `11.21.0` through Corepack

#### Scenario: CI runs root verification commands
- **WHEN** dependencies are installed in CI
- **THEN** the workflow runs root build, test, and lint commands that cover backend, frontend, and SDK workspace packages

#### Scenario: CI validates OpenSpec
- **WHEN** code verification runs in CI
- **THEN** the workflow validates OpenSpec changes and specs in strict mode using the committed OpenSpec CLI workflow

### Requirement: Backend can run from a container image

The system SHALL provide a Docker build path for running the backend API from compiled production output.

#### Scenario: Backend image builds
- **WHEN** a developer builds the backend Docker image from the repository root
- **THEN** the build installs workspace dependencies reproducibly, compiles the backend, and produces an image that starts the API with `node dist/main.js`

#### Scenario: Backend container uses environment configuration
- **WHEN** the backend container starts
- **THEN** it reads database, Redis, auth, CORS, port, and migration settings from environment variables rather than hardcoded local-only values

#### Scenario: Backend container exposes health
- **WHEN** the backend container is healthy
- **THEN** `GET /api/v1/health` succeeds through the documented backend port

### Requirement: Frontend can run from a container image

The system SHALL provide a Docker build path for serving the built frontend dashboard.

#### Scenario: Frontend image builds
- **WHEN** a developer builds the frontend Docker image from the repository root
- **THEN** the build installs workspace dependencies reproducibly, compiles the Vite app, and produces an image that serves static assets

#### Scenario: Frontend container points to backend API
- **WHEN** the frontend image is built for local compose
- **THEN** the dashboard is configured to call the documented backend API URL

#### Scenario: Frontend container serves dashboard
- **WHEN** the frontend container is running
- **THEN** the documented frontend port serves the dashboard entrypoint

### Requirement: Docker Compose can run the full stack

The system SHALL provide Docker Compose configuration for local full-stack operation.

#### Scenario: Full-stack compose starts dependencies and apps
- **WHEN** a developer runs the documented full-stack Docker Compose command
- **THEN** PostgreSQL, Redis, backend, and frontend services start with dependencies and ports wired for local use

#### Scenario: Compose preserves infrastructure-only development flow
- **WHEN** a developer uses Docker Compose only for PostgreSQL and Redis
- **THEN** the existing local `pnpm dev` workflow remains documented and usable

#### Scenario: Compose health checks surface readiness
- **WHEN** services are started through Docker Compose
- **THEN** PostgreSQL, Redis, backend, and frontend expose health or readiness checks appropriate to their runtime

### Requirement: Operational documentation is complete

The system SHALL document CI, Docker, environment, migration, seed, and smoke-check workflows for local project operation.

#### Scenario: Environment examples distinguish local and container values
- **WHEN** a developer reads committed environment examples
- **THEN** the examples identify values needed for local pnpm development and values needed for Docker Compose operation without exposing real secrets

#### Scenario: README documents Docker flow
- **WHEN** a developer reads the README
- **THEN** it includes commands for building/running the full stack, running migrations or seed data, and opening the backend/frontend URLs

#### Scenario: Smoke checks are documented or scripted
- **WHEN** a developer wants to confirm the stack works after startup
- **THEN** the project provides documented or scripted checks for backend health, seeded login readiness, SDK evaluation, and at least one read-model endpoint

