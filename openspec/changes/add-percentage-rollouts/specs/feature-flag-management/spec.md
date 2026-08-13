## MODIFIED Requirements

### Requirement: User can configure boolean flag per environment

The system SHALL allow an authenticated user to update enabled state, boolean value, and rollout percentage for a feature flag configuration in a project environment.

#### Scenario: Enable boolean flag in environment
- **WHEN** an authenticated user enables a boolean feature flag configuration for an environment
- **THEN** the system persists `enabled` true for that environment configuration

#### Scenario: Update boolean value in environment
- **WHEN** an authenticated user changes the boolean value for an environment configuration
- **THEN** the system persists the new boolean value for that environment configuration

#### Scenario: Update rollout percentage in environment
- **WHEN** an authenticated user changes rollout percentage for an environment configuration to an integer from 0 through 100
- **THEN** the system persists the new rollout percentage for that environment configuration

#### Scenario: Invalid rollout percentage is rejected
- **WHEN** an authenticated user submits a rollout percentage below 0, above 100, or not an integer
- **THEN** the system rejects the update without changing the environment configuration

#### Scenario: Environment not in project
- **WHEN** an authenticated user updates a feature flag configuration for an environment outside the selected project
- **THEN** the system rejects or hides the environment configuration as not found

### Requirement: Demo seed includes feature flags

The system SHALL seed local demo feature flags and rollout configuration for the demo project.

#### Scenario: Seed creates demo feature flags
- **WHEN** a developer runs `pnpm seed`
- **THEN** the demo project contains repeatable boolean feature flags with per-environment configurations

#### Scenario: Seed creates demo rollout configuration
- **WHEN** a developer runs `pnpm seed`
- **THEN** at least one demo feature flag environment configuration has a representative rollout percentage for local dashboard and SDK testing

#### Scenario: Seed is idempotent for feature flags
- **WHEN** a developer reruns `pnpm seed`
- **THEN** the seed updates or preserves the demo feature flags and rollout percentages without creating duplicates

### Requirement: Environment flag config mutations emit audit events

The system SHALL record audit events after successful per-environment feature flag configuration changes.

#### Scenario: Environment flag config update audit
- **WHEN** an authenticated user updates enabled state, boolean value, or rollout percentage for a feature flag environment configuration
- **THEN** the system records a `FEATURE_FLAG_CONFIG_UPDATED` audit event with old and new values for changed fields

#### Scenario: Environment flag config audit context
- **WHEN** the system records a feature flag config audit event
- **THEN** the event includes feature flag id, project id, environment id, resource name, and actor metadata
