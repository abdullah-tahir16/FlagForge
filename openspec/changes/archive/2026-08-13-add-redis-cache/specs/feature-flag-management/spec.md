## ADDED Requirements

### Requirement: Feature flag mutations invalidate evaluation cache
The system SHALL invalidate affected Redis evaluation cache entries after successful feature flag and environment flag configuration mutations.

#### Scenario: Feature flag creation invalidates project environment caches
- **WHEN** an authenticated user creates a feature flag for a project
- **THEN** the system invalidates evaluation cache entries for the project environments that receive default flag configurations

#### Scenario: Feature flag metadata update invalidates environment caches
- **WHEN** an authenticated user updates feature flag metadata that appears in evaluation snapshots
- **THEN** the system invalidates evaluation cache entries for that flag's environment configurations

#### Scenario: Feature flag deletion invalidates environment caches
- **WHEN** an authenticated user deletes a feature flag
- **THEN** the system invalidates evaluation cache entries for the deleted flag's environment configurations

#### Scenario: Environment flag config update invalidates one environment cache
- **WHEN** an authenticated user updates enabled state, boolean value, or rollout percentage for a feature flag environment configuration
- **THEN** the system invalidates the evaluation cache entry for that environment
