## ADDED Requirements

### Requirement: Segments are project scoped
The system SHALL scope every segment to exactly one project and protect access through the owning project organization.

#### Scenario: Segment belongs to project
- **WHEN** an authenticated user creates a segment for a project
- **THEN** the system assigns the segment to that project

#### Scenario: Cross-organization segment access
- **WHEN** an authenticated user requests a segment through a project outside their organization
- **THEN** the system rejects or hides the project and segment as not found

### Requirement: User can create segments
The system SHALL allow an authenticated user to create a segment with a name, stable key, optional description, and match mode.

#### Scenario: Successful segment creation
- **WHEN** an authenticated user submits a valid segment name for a project in their organization
- **THEN** the system creates the segment and returns its id, project id, name, key, description, match mode, timestamps, and conditions

#### Scenario: Duplicate segment key in project
- **WHEN** an authenticated user submits a segment name or key that resolves to an existing segment key in the same project
- **THEN** the system rejects the request without creating a duplicate segment

#### Scenario: Invalid match mode
- **WHEN** an authenticated user submits a match mode other than `MATCH_ALL` or `MATCH_ANY`
- **THEN** the system rejects the request without creating a segment

### Requirement: User can list project segments
The system SHALL allow an authenticated user to list segments for a project in their organization with cursor pagination.

#### Scenario: Project segment list
- **WHEN** an authenticated user requests segments for a project in their organization with valid pagination parameters
- **THEN** the system returns a cursor-paginated list of project segments ordered by creation date

#### Scenario: Project with no segments
- **WHEN** an authenticated user requests segments for a project that has none
- **THEN** the system returns an empty paginated list

### Requirement: User can read segment details
The system SHALL allow an authenticated user to read a segment and its ordered conditions for a project in their organization.

#### Scenario: Segment detail lookup
- **WHEN** an authenticated user requests a segment id through its project
- **THEN** the system returns the segment and conditions ordered by ascending sort order

#### Scenario: Segment not in project
- **WHEN** an authenticated user requests a segment id through a different project
- **THEN** the system rejects or hides the segment as not found

### Requirement: User can update segment metadata
The system SHALL allow an authenticated user to update editable segment metadata and match mode.

#### Scenario: Successful segment update
- **WHEN** an authenticated user submits valid updates for segment name, description, or match mode
- **THEN** the system updates the editable fields and returns the updated segment

#### Scenario: Segment key remains stable after rename
- **WHEN** an authenticated user changes a segment name
- **THEN** the system keeps the segment key stable

### Requirement: User can delete segments
The system SHALL allow an authenticated user to delete a segment that is not referenced by targeting rules.

#### Scenario: Successful segment deletion
- **WHEN** an authenticated user deletes an unreferenced segment in their organization
- **THEN** the system removes the segment and its conditions

#### Scenario: Referenced segment deletion is rejected
- **WHEN** an authenticated user deletes a segment referenced by a targeting rule
- **THEN** the system rejects the deletion without removing the segment

### Requirement: User can manage segment conditions
The system SHALL allow an authenticated user to create, update, delete, and reorder segment conditions.

#### Scenario: Successful condition creation
- **WHEN** an authenticated user submits a valid attribute, operator, and comparison value for a segment
- **THEN** the system creates the condition at the end of the segment condition list

#### Scenario: Successful condition update
- **WHEN** an authenticated user submits valid edits for a segment condition
- **THEN** the system persists the edited attribute, operator, or comparison value

#### Scenario: Successful condition deletion
- **WHEN** an authenticated user deletes a segment condition
- **THEN** the system removes the condition and preserves a valid order for remaining conditions

#### Scenario: Successful condition reorder
- **WHEN** an authenticated user submits every condition id for a segment in a new order
- **THEN** the system persists contiguous sort order values matching that order

### Requirement: Segments support match modes
The system SHALL evaluate segment conditions according to the segment match mode.

#### Scenario: Match all conditions
- **WHEN** a segment uses `MATCH_ALL`
- **THEN** the segment matches only when every condition matches the evaluation context

#### Scenario: Match any condition
- **WHEN** a segment uses `MATCH_ANY`
- **THEN** the segment matches when at least one condition matches the evaluation context

#### Scenario: Empty segment does not match
- **WHEN** a segment has no conditions
- **THEN** the segment does not match any evaluation context

### Requirement: Segment mutations emit audit events
The system SHALL record audit events after successful segment and segment condition mutations.

#### Scenario: Segment creation audit
- **WHEN** an authenticated user creates a segment
- **THEN** the system records a `SEGMENT_CREATED` audit event

#### Scenario: Segment update audit
- **WHEN** an authenticated user updates segment metadata
- **THEN** the system records a `SEGMENT_UPDATED` audit event with old and new values for changed fields

#### Scenario: Segment deletion audit
- **WHEN** an authenticated user deletes a segment
- **THEN** the system records a `SEGMENT_DELETED` audit event before or during deletion so the deleted segment remains identifiable

#### Scenario: Segment condition mutation audit
- **WHEN** an authenticated user creates, updates, deletes, or reorders segment conditions
- **THEN** the system records a segment condition audit event with safe snapshots
