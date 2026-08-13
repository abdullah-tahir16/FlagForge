## ADDED Requirements

### Requirement: Project mutations emit audit events

The system SHALL record audit events after successful project creation, update, and deletion.

#### Scenario: Project creation audit
- **WHEN** an authenticated user creates a project
- **THEN** the system records a `PROJECT_CREATED` audit event

#### Scenario: Project update audit
- **WHEN** an authenticated user updates project profile fields
- **THEN** the system records a `PROJECT_UPDATED` audit event with old and new values for changed fields

#### Scenario: Project deletion audit
- **WHEN** an authenticated user deletes a project
- **THEN** the system records a `PROJECT_DELETED` audit event before or during deletion so the deleted project remains identifiable
