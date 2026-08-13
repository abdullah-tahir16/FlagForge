## ADDED Requirements

### Requirement: Dashboard supports segment management
The system SHALL provide token-driven dashboard UI for managing project segments and segment conditions.

#### Scenario: Segments navigation is available
- **WHEN** an authenticated user views the dashboard shell after segment management is implemented
- **THEN** the Segments navigation item is enabled, uses a consistent icon and label, and has visible active state on segment routes

#### Scenario: Project segment list screen
- **WHEN** an authenticated user opens a project's segment route
- **THEN** the dashboard displays project segments in a dense management surface with create, open, and delete actions

#### Scenario: Segment detail screen
- **WHEN** an authenticated user opens a segment detail route
- **THEN** the dashboard displays segment metadata, match mode, and ordered segment condition management

#### Scenario: Segment condition form validation
- **WHEN** an authenticated user creates or edits a segment condition
- **THEN** the dashboard uses React Final Form and Zod validation for attribute, operator, and comparison value fields

#### Scenario: Segment destructive confirmation
- **WHEN** a user starts deleting a segment or segment condition
- **THEN** the dashboard shows a themed confirmation dialog with cancel and destructive confirm actions

#### Scenario: Segment responsive layout
- **WHEN** segment screens are viewed at 375px, 1024px, and 1440px
- **THEN** navigation, forms, rows, condition controls, badges, and actions fit without horizontal scrolling or incoherent overlap

## MODIFIED Requirements

### Requirement: Dashboard supports feature flag management
The system SHALL provide dashboard routes and token-driven UI for managing boolean feature flags, per-environment rollout configuration, targeting rules, and segment references.

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
- **THEN** the dashboard displays feature flag metadata, per-environment boolean configuration rows, and targeting rule management for each environment configuration

#### Scenario: Environment rollout control
- **WHEN** an authenticated user edits a feature flag environment configuration
- **THEN** the dashboard provides a compact rollout percentage control validated from 0 through 100 alongside enabled state and served boolean value

#### Scenario: Targeting rule manager
- **WHEN** an authenticated user manages rules for a feature flag environment configuration
- **THEN** the dashboard provides dense ordered rule rows with create, edit, delete, reorder, and segment-reference actions using shared common controls

#### Scenario: Targeting rule form validation
- **WHEN** an authenticated user creates or edits a targeting rule
- **THEN** the dashboard uses React Final Form and Zod validation for condition source, segment selection or attribute condition fields, and boolean result fields

#### Scenario: Feature flag empty state
- **WHEN** a project has no feature flags
- **THEN** the dashboard shows a themed empty state with a create-feature-flag action

#### Scenario: Feature flag destructive confirmation
- **WHEN** a user starts deleting a feature flag or targeting rule
- **THEN** the dashboard shows a themed confirmation dialog with cancel and destructive confirm actions

#### Scenario: Feature flag responsive layout
- **WHEN** flag management screens are viewed at 375px, 1024px, and 1440px
- **THEN** navigation, forms, rows, toggles, rollout controls, targeting rule controls, segment selectors, badges, and actions fit without horizontal scrolling or incoherent overlap
