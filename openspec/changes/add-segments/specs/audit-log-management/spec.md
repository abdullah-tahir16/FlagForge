## ADDED Requirements

### Requirement: Audit entries capture segment changes
The system SHALL record and expose audit metadata for segment and segment condition creation, update, deletion, and reorder operations.

#### Scenario: Segment audit metadata
- **WHEN** the system records a segment audit event
- **THEN** the event includes organization id, actor metadata, project id, segment id, resource name when available, and creation timestamp

#### Scenario: Segment update snapshots
- **WHEN** an authenticated user updates segment metadata or match mode
- **THEN** the audit entry old and new value snapshots include changed segment fields without sensitive values

#### Scenario: Segment condition mutation snapshots
- **WHEN** an authenticated user mutates segment conditions
- **THEN** the audit entry old and new value snapshots include safe condition fields and ordered condition identifiers when relevant

#### Scenario: Segment audit filters
- **WHEN** an authenticated user filters audit logs by segment or segment condition resource type or action
- **THEN** the system returns matching organization-scoped segment audit entries
