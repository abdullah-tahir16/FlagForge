## ADDED Requirements

### Requirement: Dashboard supports analytics viewing

The system SHALL provide token-driven dashboard UI for viewing project evaluation analytics.

#### Scenario: Analytics navigation is available
- **WHEN** an authenticated user views project-level dashboard actions after analytics is implemented
- **THEN** the dashboard provides a clear action to view that project's analytics

#### Scenario: Analytics overview screen
- **WHEN** an authenticated user opens a project analytics route
- **THEN** the dashboard displays compact metric panels and scan-friendly visual summaries for evaluation activity

#### Scenario: Analytics filter controls
- **WHEN** an authenticated user filters analytics by environment, flag, or time range
- **THEN** the dashboard uses token-driven controls and refreshes analytics data without page-local navigation

#### Scenario: Analytics responsive layout
- **WHEN** analytics screens are viewed at 375px, 1024px, and 1440px
- **THEN** filters, metric panels, trend visuals, and lists fit without horizontal scrolling or incoherent overlap
