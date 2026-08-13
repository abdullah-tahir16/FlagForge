## ADDED Requirements

### Requirement: Audit entries capture targeting rule changes
The system SHALL record and expose audit metadata for targeting rule creation, update, deletion, and reorder operations.

#### Scenario: Targeting rule audit metadata
- **WHEN** the system records a targeting rule audit event
- **THEN** the event includes organization id, actor metadata, project id, environment id, feature flag or environment flag config context, rule id, resource name when available, and creation timestamp

#### Scenario: Targeting rule update snapshots
- **WHEN** an authenticated user updates a targeting rule
- **THEN** the audit entry old and new value snapshots include changed rule fields without sensitive values

#### Scenario: Targeting rule reorder snapshots
- **WHEN** an authenticated user reorders targeting rules
- **THEN** the audit entry old and new value snapshots include safe ordered rule identifiers

#### Scenario: Targeting rule audit filters
- **WHEN** an authenticated user filters audit logs by targeting rule resource type or action
- **THEN** the system returns matching organization-scoped targeting rule audit entries
