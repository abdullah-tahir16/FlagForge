## ADDED Requirements

### Requirement: Feature flag mutations publish realtime configuration events
The system SHALL publish realtime configuration events after successful feature flag and environment flag configuration mutations.

#### Scenario: Feature flag creation publishes event
- **WHEN** an authenticated user creates a feature flag for a project
- **THEN** the system publishes a `CONFIGURATION_CHANGED` event for that project and affected environments

#### Scenario: Feature flag metadata update publishes event
- **WHEN** an authenticated user updates feature flag metadata
- **THEN** the system publishes a `CONFIGURATION_CHANGED` event for that project and the flag's environment configurations

#### Scenario: Feature flag deletion publishes event
- **WHEN** an authenticated user deletes a feature flag
- **THEN** the system publishes a `CONFIGURATION_CHANGED` event for that project and the deleted flag's affected environments

#### Scenario: Environment flag config update publishes event
- **WHEN** an authenticated user updates enabled state, boolean value, or rollout percentage for a feature flag environment configuration
- **THEN** the system publishes a `CONFIGURATION_CHANGED` event for that project and environment
