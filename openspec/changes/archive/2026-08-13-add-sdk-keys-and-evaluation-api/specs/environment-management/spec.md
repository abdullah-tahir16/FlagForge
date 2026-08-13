## ADDED Requirements

### Requirement: Environments own SDK key context

The system SHALL use environments as the ownership and evaluation context for SDK keys.

#### Scenario: Environment identifies evaluation scope
- **WHEN** an SDK key is created for an environment
- **THEN** that key identifies exactly one organization, project, and environment through the environment relationship

#### Scenario: Environment deletion removes SDK keys
- **WHEN** an environment is deleted by a supported workflow
- **THEN** the system removes or invalidates SDK keys scoped to that environment
