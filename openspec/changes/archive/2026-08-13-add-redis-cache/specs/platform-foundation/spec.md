## MODIFIED Requirements

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
