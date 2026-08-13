## MODIFIED Requirements

### Requirement: Dashboard uses a shared application shell

The system SHALL render authenticated dashboard screens inside a shared application shell with persistent navigation, organization context, and user context.

#### Scenario: Desktop dashboard navigation
- **WHEN** an authenticated user opens a dashboard route on a desktop viewport
- **THEN** the dashboard displays persistent navigation with visible route labels and active route state

#### Scenario: Mobile dashboard navigation
- **WHEN** an authenticated user opens a dashboard route on a mobile viewport
- **THEN** the dashboard provides compact navigation that keeps primary routes reachable without horizontal scrolling

#### Scenario: No unreachable navigation destinations
- **WHEN** the dashboard shell renders its navigation items
- **THEN** every navigation item links to an implemented route, and no permanently disabled placeholder navigation item is shown

### Requirement: Dashboard uses themed destructive confirmation

The system SHALL use a themed accessible confirmation flow for destructive dashboard actions, and the confirmation dialog SHALL accurately label the specific action in progress.

#### Scenario: Delete project confirmation
- **WHEN** a user starts deleting a project
- **THEN** the dashboard shows a themed confirmation dialog with cancel and destructive confirm actions

#### Scenario: Cancel destructive action
- **WHEN** a user cancels the confirmation dialog
- **THEN** the system does not delete the project

#### Scenario: Confirmation reflects the actual action
- **WHEN** a destructive confirmation dialog is showing its in-progress state for a non-delete action, such as revoking an SDK key
- **THEN** the dialog's in-progress label matches that specific action and does not display a generic or unrelated verb such as "Deleting"

## ADDED Requirements

### Requirement: Dashboard avoids decorative elements that misrepresent data

The system SHALL NOT render UI elements that visually imply real data, metrics, or a meaningful selection when the underlying value is fixed, hardcoded, or structurally incapable of varying.

#### Scenario: No fixed-position data visuals
- **WHEN** a dashboard screen renders a visual element styled as a progress indicator, metric, or highlighted selection
- **THEN** the element's position, fill, or highlighted state reflects a real computed value, or the element is not rendered

#### Scenario: Single-value fields are not shown as distinguishing metadata
- **WHEN** a field can only ever hold one possible value across all records, such as a feature flag's type
- **THEN** the dashboard does not render that field as a per-record badge implying it varies

#### Scenario: Count copy uses correct pluralization
- **WHEN** the dashboard displays a count of entities such as segments, flags, or rules
- **THEN** the accompanying label uses the grammatically correct singular or plural form for that count, and both branches of any pluralization logic are not identical

### Requirement: Dashboard uses consistent terminology and action-state copy

The system SHALL use one canonical term for the tenant entity and consistent phrasing for in-progress action labels across the dashboard.

#### Scenario: Organization terminology consistency
- **WHEN** any dashboard screen, form, or shell element refers to the authenticated tenant entity
- **THEN** it uses the term "Organization" and does not use "Workspace" or "Local workspace" as alternate labels for the same entity

#### Scenario: Feature flag terminology consistency within a flow
- **WHEN** a single dialog, form, or confirmation flow refers to a feature flag
- **THEN** it uses one consistent term ("flag" or "feature flag") throughout that flow rather than mixing both

#### Scenario: In-progress button labels follow one pattern
- **WHEN** a dashboard submit or destructive action is in progress
- **THEN** its button label uses the action's present-participle verb (e.g. "Saving", "Creating", "Deleting", "Revoking") consistently, rather than an unrelated phrase such as "Please wait"

### Requirement: Demo credentials are not shown outside local or demo environments

The system SHALL gate the display of local demo login credentials behind an explicit build-time configuration flag.

#### Scenario: Demo credentials shown when explicitly enabled
- **WHEN** the frontend is built or run with the demo-credentials flag enabled
- **THEN** the login and registration screens show the local demo credentials alert

#### Scenario: Demo credentials hidden by default
- **WHEN** the frontend is built or run without the demo-credentials flag enabled
- **THEN** the login and registration screens do not render the local demo credentials alert
