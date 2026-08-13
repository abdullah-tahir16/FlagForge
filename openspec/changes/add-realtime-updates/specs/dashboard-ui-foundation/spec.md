## ADDED Requirements

### Requirement: Dashboard reacts to realtime configuration events
The dashboard SHALL use backend realtime configuration events to refresh stale project configuration data.

#### Scenario: Project configuration event invalidates dashboard data
- **WHEN** the dashboard receives a `CONFIGURATION_CHANGED` realtime event for the active organization and project
- **THEN** the frontend invalidates relevant TanStack Query caches for project flags, flag detail, targeting rules, segments, segment options, and audit data

#### Scenario: Realtime disconnect preserves dashboard usability
- **WHEN** the realtime stream is disconnected or unavailable
- **THEN** the dashboard remains usable through existing query loading, mutation responses, and manual navigation refresh behavior

#### Scenario: Logout closes realtime stream
- **WHEN** the user logs out
- **THEN** the dashboard closes any active realtime stream and stops reconnecting
