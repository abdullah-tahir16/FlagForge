# audit-log-management Specification

## Purpose

Define organization-scoped audit event persistence, management API listing, filtering, pagination, and dashboard audit log visibility.
## Requirements
### Requirement: Audit logs are organization scoped

The system SHALL scope every audit log entry to exactly one organization.

#### Scenario: Audit entry belongs to organization
- **WHEN** the system records an audit event for an authenticated management operation
- **THEN** the audit entry stores the authenticated user's organization id

#### Scenario: Cross-organization audit access
- **WHEN** an authenticated user lists audit entries
- **THEN** the system returns only audit entries for that user's organization

### Requirement: Audit entries capture actor and resource metadata

The system SHALL store useful actor, action, resource, context, and timestamp metadata for each audit entry.

#### Scenario: Audit entry metadata
- **WHEN** the system records an audit event
- **THEN** it stores actor user id, actor email, action, resource type, resource id, resource name when available, project id when available, environment id when available, IP address when available, and creation timestamp

#### Scenario: Deleted resource remains readable
- **WHEN** a resource is deleted after audit entries exist
- **THEN** the audit entries remain readable without requiring the deleted resource row

### Requirement: Audit entries capture safe old and new values

The system SHALL store safe old and new value snapshots for mutation events where practical.

#### Scenario: Update value snapshots
- **WHEN** a management operation changes editable resource data
- **THEN** the audit entry includes old and new value snapshots for the changed fields

#### Scenario: Sensitive values are excluded
- **WHEN** the system records an audit event
- **THEN** it does not store raw SDK secrets, password hashes, refresh tokens, JWTs, or cookie values

### Requirement: User can list audit logs

The system SHALL allow an authenticated user to list audit logs for their organization.

#### Scenario: Audit list
- **WHEN** an authenticated user requests audit logs
- **THEN** the system returns organization-scoped audit entries ordered by newest first

#### Scenario: Empty audit list
- **WHEN** an authenticated user requests audit logs and none exist
- **THEN** the system returns an empty list

### Requirement: User can filter audit logs

The system SHALL allow an authenticated user to filter audit logs by common operational dimensions.

#### Scenario: Filter by project
- **WHEN** an authenticated user requests audit logs for a project id in their organization
- **THEN** the system returns matching audit entries for that project

#### Scenario: Filter by resource type
- **WHEN** an authenticated user requests audit logs for a resource type
- **THEN** the system returns matching audit entries for that resource type

#### Scenario: Filter by action
- **WHEN** an authenticated user requests audit logs for an action
- **THEN** the system returns matching audit entries for that action

### Requirement: Audit log listing is paginated

The system SHALL paginate audit log listing responses.

#### Scenario: Limited audit results
- **WHEN** an authenticated user requests audit logs with a valid limit
- **THEN** the system returns no more than that number of entries

#### Scenario: Next page token
- **WHEN** more audit entries are available after the current page
- **THEN** the system returns metadata that allows the next page to be requested

### Requirement: Demo workflow has audit entries

The system SHALL make audit log behavior visible in the local demo workflow.

#### Scenario: Local audit entries exist
- **WHEN** a developer runs local demo workflows after seeding
- **THEN** the dashboard can show representative audit entries without manual database edits

### Requirement: Audit entries capture rollout changes

The system SHALL include rollout percentage changes in environment flag configuration audit snapshots.

#### Scenario: Rollout percentage update audit snapshot
- **WHEN** an authenticated user updates a feature flag environment rollout percentage
- **THEN** the audit entry old and new value snapshots include the previous and current rollout percentages

#### Scenario: Rollout audit uses existing config action
- **WHEN** the system records a rollout percentage update
- **THEN** the audit entry uses the `FEATURE_FLAG_CONFIG_UPDATED` action and environment flag config resource type

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

