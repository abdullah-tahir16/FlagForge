## ADDED Requirements

### Requirement: Feature flag mutations emit audit events

The system SHALL record audit events after successful feature flag creation, update, and deletion.

#### Scenario: Feature flag creation audit
- **WHEN** an authenticated user creates a feature flag
- **THEN** the system records a `FEATURE_FLAG_CREATED` audit event

#### Scenario: Feature flag update audit
- **WHEN** an authenticated user updates feature flag metadata
- **THEN** the system records a `FEATURE_FLAG_UPDATED` audit event with old and new values for changed fields

#### Scenario: Feature flag deletion audit
- **WHEN** an authenticated user deletes a feature flag
- **THEN** the system records a `FEATURE_FLAG_DELETED` audit event before or during deletion so the deleted flag remains identifiable

### Requirement: Environment flag config mutations emit audit events

The system SHALL record audit events after successful per-environment feature flag configuration changes.

#### Scenario: Environment flag config update audit
- **WHEN** an authenticated user updates enabled state or boolean value for a feature flag environment configuration
- **THEN** the system records a `FEATURE_FLAG_CONFIG_UPDATED` audit event with old and new values for changed fields

#### Scenario: Environment flag config audit context
- **WHEN** the system records a feature flag config audit event
- **THEN** the event includes feature flag id, project id, environment id, resource name, and actor metadata
