## ADDED Requirements

### Requirement: Project creation creates default environments

The system SHALL create default environments for every newly created project.

#### Scenario: Default environments are created
- **WHEN** an authenticated user creates a project
- **THEN** the system creates Development, Staging, and Production environments for that project

#### Scenario: Project creation is atomic
- **WHEN** default environment creation fails during project creation
- **THEN** the system does not persist a project without its default environments

### Requirement: Environments are project scoped

The system SHALL scope every environment to exactly one project and protect access through the project's organization.

#### Scenario: Environment belongs to project
- **WHEN** the system creates an environment
- **THEN** the environment is linked to exactly one project

#### Scenario: Cross-organization environment access
- **WHEN** an authenticated user requests environments for a project outside their organization
- **THEN** the system rejects or hides the project and environments as not found

### Requirement: User can list project environments

The system SHALL allow an authenticated user to list environments for a project in their organization.

#### Scenario: Environment list
- **WHEN** an authenticated user requests environments for a project in their organization
- **THEN** the system returns the project's environments ordered by sort order

### Requirement: User can update an environment

The system SHALL allow an authenticated user to update editable environment profile fields for a project in their organization.

#### Scenario: Successful environment update
- **WHEN** an authenticated user submits valid environment updates for a project in their organization
- **THEN** the system updates the editable fields and returns the updated environment

#### Scenario: Environment key remains stable after rename
- **WHEN** an authenticated user changes an environment name
- **THEN** the system keeps the environment key stable unless key-editing is explicitly supported by a later change

### Requirement: Dashboard supports environment management

The system SHALL show project environments on the project detail dashboard surface.

#### Scenario: Project detail shows environments
- **WHEN** an authenticated user opens a project detail route
- **THEN** the dashboard displays the project's environments in their configured order

#### Scenario: Environment edit from dashboard
- **WHEN** an authenticated user edits an environment name from the project detail route
- **THEN** the dashboard submits the update and refreshes the displayed environment data
