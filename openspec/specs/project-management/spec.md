# project-management Specification

## Purpose
TBD - created by archiving change add-projects-and-environments. Update Purpose after archive.
## Requirements
### Requirement: Projects are organization scoped

The system SHALL scope every project to exactly one organization.

#### Scenario: Project belongs to current organization
- **WHEN** an authenticated user creates a project
- **THEN** the system assigns the project to the user's current organization

#### Scenario: Project list is organization scoped
- **WHEN** an authenticated user lists projects
- **THEN** the system returns only projects assigned to the user's current organization

### Requirement: User can create a project

The system SHALL allow an authenticated user to create a project with a name and optional description.

#### Scenario: Successful project creation
- **WHEN** an authenticated user submits a valid project name
- **THEN** the system creates the project and returns its id, name, key, description, organization id, and timestamps

#### Scenario: Duplicate project key in organization
- **WHEN** an authenticated user submits a project name that resolves to an existing project key in the same organization
- **THEN** the system rejects the request without creating a duplicate project

### Requirement: User can read project details

The system SHALL allow an authenticated user to read details for a project in their organization.

#### Scenario: Project detail lookup
- **WHEN** an authenticated user requests a project id that belongs to their organization
- **THEN** the system returns the project details

#### Scenario: Cross-organization project lookup
- **WHEN** an authenticated user requests a project id outside their organization
- **THEN** the system rejects or hides the project as not found

### Requirement: User can update a project

The system SHALL allow an authenticated user to update editable project profile fields for a project in their organization.

#### Scenario: Successful project update
- **WHEN** an authenticated user submits valid project updates for a project in their organization
- **THEN** the system updates the editable fields and returns the updated project

#### Scenario: Project key remains stable after rename
- **WHEN** an authenticated user changes a project name
- **THEN** the system keeps the project key stable unless key-editing is explicitly supported by a later change

### Requirement: User can delete a project

The system SHALL allow an authenticated user to delete a project in their organization while preserving organization isolation.

#### Scenario: Successful project deletion
- **WHEN** an authenticated user deletes a project in their organization
- **THEN** the system removes the project and its project-scoped environments

#### Scenario: Cross-organization project deletion
- **WHEN** an authenticated user attempts to delete a project outside their organization
- **THEN** the system rejects or hides the project as not found

### Requirement: Dashboard supports project management

The system SHALL provide dashboard routes and state for listing, creating, viewing, updating, and deleting projects.

#### Scenario: Project list screen
- **WHEN** an authenticated user opens the projects dashboard
- **THEN** the dashboard displays projects from the current organization and a create-project action

#### Scenario: Project detail navigation
- **WHEN** an authenticated user selects a project
- **THEN** the dashboard navigates to a project detail route for that project

