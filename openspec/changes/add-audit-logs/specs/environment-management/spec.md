## ADDED Requirements

### Requirement: Environment mutations emit audit events

The system SHALL record audit events after successful environment profile changes.

#### Scenario: Environment update audit
- **WHEN** an authenticated user updates an environment name
- **THEN** the system records an `ENVIRONMENT_UPDATED` audit event with old and new values for changed fields

#### Scenario: Environment audit context
- **WHEN** the system records an environment audit event
- **THEN** the event includes the environment id, project id, environment name, and actor metadata
