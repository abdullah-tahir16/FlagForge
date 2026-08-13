# organization-membership Specification

## Purpose
TBD - created by archiving change add-auth-and-organization. Update Purpose after archive.
## Requirements
### Requirement: Registration creates organization ownership

The system SHALL create an organization during registration and assign the registering user as OWNER of that organization.

#### Scenario: Organization created during registration

- **WHEN** a visitor successfully registers with an organization name
- **THEN** the system creates an organization with that name and links the new user to it

#### Scenario: First user receives owner role

- **WHEN** registration completes successfully
- **THEN** the registered user has the OWNER role in the created organization

### Requirement: User belongs to one active organization

The system SHALL associate each management user with one active organization for this MVP slice.

#### Scenario: Authenticated user organization context

- **WHEN** an authenticated user calls protected management APIs
- **THEN** the system can resolve the user's organization id from the authenticated user context

### Requirement: Current organization can be read

The system SHALL allow an authenticated user to retrieve their current organization.

#### Scenario: Current organization lookup

- **WHEN** an authenticated user requests the current organization
- **THEN** the system returns the organization's id, name, key, and timestamps

#### Scenario: Unauthenticated organization lookup

- **WHEN** a visitor requests the current organization without authentication
- **THEN** the system rejects the request as unauthorized

### Requirement: Current organization can be updated by owner

The system SHALL allow an OWNER to update basic current organization profile fields.

#### Scenario: Owner updates organization

- **WHEN** an OWNER submits a valid organization name update
- **THEN** the system updates the current organization and returns the updated organization

#### Scenario: Organization key remains stable

- **WHEN** an OWNER updates the organization name
- **THEN** the system keeps the organization key stable unless key-editing is explicitly supported by a later change

### Requirement: Organization responses exclude unrelated users

The system SHALL not expose organization member lists from the current organization endpoints in this change.

#### Scenario: Current organization response

- **WHEN** an authenticated user retrieves the current organization
- **THEN** the response includes organization profile fields but does not include a list of users

