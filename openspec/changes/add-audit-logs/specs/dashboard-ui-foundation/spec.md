## ADDED Requirements

### Requirement: Dashboard supports audit log viewing

The system SHALL provide a token-driven dashboard route for viewing organization audit logs.

#### Scenario: Audit navigation is available
- **WHEN** an authenticated user views the dashboard shell after audit logs are implemented
- **THEN** the Audit navigation item is enabled, uses a consistent icon and label, and has visible active state on audit routes

#### Scenario: Audit log screen
- **WHEN** an authenticated user opens the audit route
- **THEN** the dashboard displays audit entries in a dense management surface with action, resource, actor, context, and timestamp

#### Scenario: Audit empty state
- **WHEN** no audit entries exist for the selected filters
- **THEN** the dashboard shows a themed empty state

#### Scenario: Audit loading and error states
- **WHEN** audit entries are loading or fail to load
- **THEN** the dashboard uses shared skeleton and alert feedback primitives

#### Scenario: Audit filters
- **WHEN** an authenticated user filters audit logs
- **THEN** the dashboard updates the audit list using token-driven controls without page-local navigation

#### Scenario: Audit responsive layout
- **WHEN** audit screens are viewed at 375px, 1024px, and 1440px
- **THEN** filters, rows, badges, timestamps, and resource metadata fit without horizontal scrolling or incoherent overlap
