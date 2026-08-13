# platform-foundation Specification

## Purpose
TBD - created by archiving change bootstrap-platform-foundation. Update Purpose after archive.
## Requirements
### Requirement: Repository uses pnpm workspaces

The system SHALL define a pnpm workspace at the repository root that includes `frontend/` and `backend/` as workspace packages.

#### Scenario: Workspace packages are discoverable

- **WHEN** a developer installs dependencies from the repository root using pnpm
- **THEN** pnpm recognizes both `frontend/` and `backend/` as workspace packages

#### Scenario: Root scripts delegate to applications

- **WHEN** a developer runs root development, build, lint, or test scripts
- **THEN** the scripts execute the corresponding workspace application commands

### Requirement: Frontend application is bootstrapped

The system SHALL provide a `frontend/` Vite React TypeScript application configured with TanStack Query, React Router, and Tailwind CSS.

#### Scenario: Frontend starts in development mode

- **WHEN** a developer runs the frontend development command
- **THEN** the Vite React application starts successfully

#### Scenario: Frontend source follows the project structure

- **WHEN** a developer inspects `frontend/src/`
- **THEN** the source tree contains `core/`, `infrastructure/`, and `presentation/` boundaries

#### Scenario: Frontend router is available

- **WHEN** the frontend application renders
- **THEN** it is mounted through React Router with at least one working route

### Requirement: Backend application is bootstrapped

The system SHALL provide a `backend/` NestJS TypeScript application configured with CQRS support, Jest testing, and TypeORM for PostgreSQL.

#### Scenario: Backend starts in development mode

- **WHEN** a developer runs the backend development command with valid environment configuration
- **THEN** the NestJS API starts successfully

#### Scenario: Backend exposes module boundaries

- **WHEN** a developer inspects `backend/src/`
- **THEN** the source tree contains NestJS module boundaries for common platform concerns and early FlagForge domains

#### Scenario: Backend tests can run

- **WHEN** a developer runs the backend test command
- **THEN** Jest executes the backend test suite successfully

### Requirement: Local Postgres infrastructure is available
The system SHALL provide Docker Compose configuration for running PostgreSQL and Redis locally.

#### Scenario: Database starts locally

- **WHEN** a developer runs Docker Compose from the repository root
- **THEN** a PostgreSQL service starts with credentials matching the documented local environment example

#### Scenario: Redis starts locally
- **WHEN** a developer runs Docker Compose from the repository root
- **THEN** a Redis service starts with connection settings matching the documented local environment example

### Requirement: Environment examples are documented
The system SHALL provide example environment configuration for local frontend and backend development, including Redis cache settings.

#### Scenario: Developer can discover required environment variables

- **WHEN** a developer opens the committed environment example files
- **THEN** the files show the required variables for running the foundation locally without exposing real secrets

#### Scenario: Developer can discover Redis variables
- **WHEN** a developer opens the committed backend environment example file
- **THEN** the file shows Redis connection and evaluation cache TTL variables for local development

### Requirement: Repository includes SDK workspace packages

The system SHALL include distributable SDK packages in the pnpm workspace without changing the `frontend/` and `backend/` application folder boundaries.

#### Scenario: JavaScript SDK workspace package is discoverable
- **WHEN** a developer installs dependencies from the repository root using pnpm
- **THEN** pnpm recognizes the JavaScript SDK package as a workspace package

#### Scenario: Root verification includes SDK package
- **WHEN** a developer runs root build, lint, or test scripts
- **THEN** the scripts execute the corresponding JavaScript SDK package commands along with the existing frontend and backend checks

