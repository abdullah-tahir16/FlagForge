# analytics-management Specification

## Purpose
TBD - created by archiving change add-analytics. Update Purpose after archive.
## Requirements
### Requirement: Evaluation events are persisted

The system SHALL persist analytics events for successful SDK flag evaluations without storing raw SDK keys or raw evaluation context.

#### Scenario: Single flag evaluation event
- **WHEN** an SDK client successfully evaluates one flag
- **THEN** the system records an evaluation event with organization id, project id, environment id, SDK key id, flag key, boolean value, reason, evaluation type, and timestamp

#### Scenario: All-flags evaluation events
- **WHEN** an SDK client successfully evaluates all flags for an environment
- **THEN** the system records one evaluation event per evaluated flag in that response

#### Scenario: Analytics event excludes raw secrets and context
- **WHEN** an evaluation event is persisted
- **THEN** the event does not include the raw SDK key, raw user id, or arbitrary context attributes

### Requirement: Analytics recording is best-effort

The system SHALL prevent analytics recording failures from failing SDK evaluation requests.

#### Scenario: Analytics write failure
- **WHEN** an SDK evaluation succeeds but analytics persistence fails
- **THEN** the SDK evaluation response is still returned using the normal evaluation result

#### Scenario: Analytics disabled by infrastructure failure
- **WHEN** PostgreSQL is temporarily unable to persist analytics events
- **THEN** SDK evaluation behavior remains unchanged except that affected analytics events may be missing

### Requirement: User can view project analytics overview

The system SHALL provide an authenticated project-scoped analytics overview for organizations.

#### Scenario: Project analytics overview
- **WHEN** an authenticated user requests analytics for a project in their organization
- **THEN** the system returns total evaluation count, true count, false count, reason breakdown, top flags, and time buckets for the selected range

#### Scenario: Empty analytics overview
- **WHEN** an authenticated user requests analytics for a project with no events in the selected range
- **THEN** the system returns zero counts, empty top flags, empty reason breakdown, and empty or zero-valued time buckets

#### Scenario: Cross-organization analytics access
- **WHEN** an authenticated user requests analytics for a project outside their organization
- **THEN** the system rejects or hides the project analytics as not found

### Requirement: Analytics overview can be filtered

The system SHALL allow project analytics overview queries to filter by environment, flag key, and bounded time range.

#### Scenario: Environment analytics filter
- **WHEN** an authenticated user requests project analytics with an environment filter for that project
- **THEN** the system returns metrics only for evaluation events in that environment

#### Scenario: Flag analytics filter
- **WHEN** an authenticated user requests project analytics with a flag key filter
- **THEN** the system returns metrics only for evaluation events for that flag key

#### Scenario: Time range analytics filter
- **WHEN** an authenticated user requests project analytics with a supported time range
- **THEN** the system returns metrics only for evaluation events in that time range

#### Scenario: Unsupported analytics range
- **WHEN** an authenticated user requests analytics with an unsupported or unbounded time range
- **THEN** the system rejects the request or falls back to a documented bounded default

### Requirement: Analytics dashboard displays evaluation metrics

The system SHALL provide a token-driven dashboard view for project analytics.

#### Scenario: Analytics route
- **WHEN** an authenticated user opens a project analytics route
- **THEN** the dashboard displays evaluation volume, true/false split, reason breakdown, top flags, and time bucket trends

#### Scenario: Analytics filters
- **WHEN** an authenticated user changes analytics filters
- **THEN** the dashboard refreshes metrics for the selected environment, flag key, and time range

#### Scenario: Analytics loading and error states
- **WHEN** analytics data is loading or fails to load
- **THEN** the dashboard uses shared skeleton and alert feedback primitives

#### Scenario: Analytics empty state
- **WHEN** no analytics events exist for the selected filters
- **THEN** the dashboard shows a themed empty state with guidance to evaluate flags through an SDK key

#### Scenario: Analytics responsive layout
- **WHEN** analytics screens are viewed at 375px, 1024px, and 1440px
- **THEN** filters, metric panels, trend visuals, and lists fit without horizontal scrolling or incoherent overlap

