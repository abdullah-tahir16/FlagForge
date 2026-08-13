## ADDED Requirements

### Requirement: Segment mutations publish realtime configuration events
The system SHALL publish realtime configuration events for segment mutations that affect dashboard-visible project configuration.

#### Scenario: Segment metadata update publishes event
- **WHEN** an authenticated user updates segment metadata or match mode
- **THEN** the system publishes a `CONFIGURATION_CHANGED` event for that project and the environments whose targeting rules reference the segment

#### Scenario: Segment condition creation publishes event
- **WHEN** an authenticated user creates a condition on a segment
- **THEN** the system publishes a `CONFIGURATION_CHANGED` event for that project and referenced environments

#### Scenario: Segment condition update publishes event
- **WHEN** an authenticated user updates a segment condition
- **THEN** the system publishes a `CONFIGURATION_CHANGED` event for that project and referenced environments

#### Scenario: Segment condition deletion publishes event
- **WHEN** an authenticated user deletes a segment condition
- **THEN** the system publishes a `CONFIGURATION_CHANGED` event for that project and referenced environments

#### Scenario: Segment condition reorder publishes event
- **WHEN** an authenticated user reorders segment conditions
- **THEN** the system publishes a `CONFIGURATION_CHANGED` event for that project and referenced environments

#### Scenario: Unreferenced segment event has no environments
- **WHEN** an authenticated user mutates a segment that no targeting rules reference
- **THEN** the system may publish a project-level `CONFIGURATION_CHANGED` event with no environment ids so segment list/detail screens can refresh
