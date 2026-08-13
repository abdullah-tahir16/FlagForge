## ADDED Requirements

### Requirement: Audit entries capture rollout changes

The system SHALL include rollout percentage changes in environment flag configuration audit snapshots.

#### Scenario: Rollout percentage update audit snapshot
- **WHEN** an authenticated user updates a feature flag environment rollout percentage
- **THEN** the audit entry old and new value snapshots include the previous and current rollout percentages

#### Scenario: Rollout audit uses existing config action
- **WHEN** the system records a rollout percentage update
- **THEN** the audit entry uses the `FEATURE_FLAG_CONFIG_UPDATED` action and environment flag config resource type
