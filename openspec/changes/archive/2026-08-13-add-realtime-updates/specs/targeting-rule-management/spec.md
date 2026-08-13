## ADDED Requirements

### Requirement: Targeting rule mutations publish realtime configuration events
The system SHALL publish realtime configuration events after successful targeting rule mutations.

#### Scenario: Targeting rule creation publishes event
- **WHEN** an authenticated user creates a targeting rule for a feature flag environment configuration
- **THEN** the system publishes a `CONFIGURATION_CHANGED` event for that project and environment

#### Scenario: Targeting rule update publishes event
- **WHEN** an authenticated user updates a targeting rule
- **THEN** the system publishes a `CONFIGURATION_CHANGED` event for that project and environment

#### Scenario: Targeting rule deletion publishes event
- **WHEN** an authenticated user deletes a targeting rule
- **THEN** the system publishes a `CONFIGURATION_CHANGED` event for that project and environment

#### Scenario: Targeting rule reorder publishes event
- **WHEN** an authenticated user reorders targeting rules
- **THEN** the system publishes a `CONFIGURATION_CHANGED` event for that project and environment
