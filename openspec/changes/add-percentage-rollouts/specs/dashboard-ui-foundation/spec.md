## MODIFIED Requirements

### Requirement: Dashboard supports feature flag management

The system SHALL provide dashboard routes and token-driven UI for managing boolean feature flags and per-environment rollout configuration.

#### Scenario: Flags navigation is available
- **WHEN** an authenticated user views the dashboard shell after feature flag management is implemented
- **THEN** the Flags navigation item is enabled, uses a consistent icon and label, and has visible active state on flag routes

#### Scenario: Project detail links to project flags
- **WHEN** an authenticated user opens a project detail route
- **THEN** the dashboard provides a clear action to manage that project's feature flags

#### Scenario: Project flag list screen
- **WHEN** an authenticated user opens a project flag list route
- **THEN** the dashboard displays project feature flags in a dense management surface with create, open, and delete actions

#### Scenario: Feature flag detail screen
- **WHEN** an authenticated user opens a feature flag detail route
- **THEN** the dashboard displays feature flag metadata and per-environment boolean configuration rows

#### Scenario: Environment rollout control
- **WHEN** an authenticated user edits a feature flag environment configuration
- **THEN** the dashboard provides a compact rollout percentage control validated from 0 through 100 alongside enabled state and served boolean value

#### Scenario: Feature flag empty state
- **WHEN** a project has no feature flags
- **THEN** the dashboard shows a themed empty state with a create-feature-flag action

#### Scenario: Feature flag destructive confirmation
- **WHEN** a user starts deleting a feature flag
- **THEN** the dashboard shows a themed confirmation dialog with cancel and destructive confirm actions

#### Scenario: Feature flag responsive layout
- **WHEN** flag management screens are viewed at 375px, 1024px, and 1440px
- **THEN** navigation, forms, rows, toggles, rollout controls, badges, and actions fit without horizontal scrolling or incoherent overlap
