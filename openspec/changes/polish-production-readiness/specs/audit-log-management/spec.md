## MODIFIED Requirements

### Requirement: Audit entries capture actor and resource metadata

The system SHALL store useful actor, action, resource, context, and timestamp metadata for each audit entry, and SHALL resolve human-readable project and environment names when listing audit entries.

#### Scenario: Audit entry metadata
- **WHEN** the system records an audit event
- **THEN** it stores actor user id, actor email, action, resource type, resource id, resource name when available, project id when available, environment id when available, IP address when available, and creation timestamp

#### Scenario: Deleted resource remains readable
- **WHEN** a resource is deleted after audit entries exist
- **THEN** the audit entries remain readable without requiring the deleted resource row

#### Scenario: Audit list resolves project and environment names
- **WHEN** an authenticated user lists audit logs that include a project id or environment id
- **THEN** the response includes the resolved current project name and environment name alongside their ids

#### Scenario: Resolved name unavailable for deleted resource
- **WHEN** an audit entry references a project or environment that no longer exists
- **THEN** the response omits or nulls the resolved name for that resource while still returning its id
