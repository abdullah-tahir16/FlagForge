## ADDED Requirements

### Requirement: Targeting rule mutations invalidate evaluation cache
The system SHALL invalidate affected Redis evaluation cache entries after successful targeting rule mutations.

#### Scenario: Targeting rule creation invalidates environment cache
- **WHEN** an authenticated user creates a targeting rule for a feature flag environment configuration
- **THEN** the system invalidates the evaluation cache entry for that environment

#### Scenario: Targeting rule update invalidates environment cache
- **WHEN** an authenticated user updates a targeting rule
- **THEN** the system invalidates the evaluation cache entry for that rule's environment

#### Scenario: Targeting rule deletion invalidates environment cache
- **WHEN** an authenticated user deletes a targeting rule
- **THEN** the system invalidates the evaluation cache entry for that rule's environment

#### Scenario: Targeting rule reorder invalidates environment cache
- **WHEN** an authenticated user reorders targeting rules
- **THEN** the system invalidates the evaluation cache entry for that rule stack's environment
