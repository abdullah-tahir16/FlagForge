# sdk-key-management Specification

## Purpose

Define environment-scoped SDK key management, including secure key storage, one-time secret display, revocation, and local demo access.

## Requirements

### Requirement: SDK keys are environment scoped

The system SHALL scope every SDK key to exactly one environment and protect management access through the environment's project organization.

#### Scenario: SDK key belongs to environment
- **WHEN** an authenticated user creates an SDK key for an environment
- **THEN** the system assigns the SDK key to that environment

#### Scenario: Cross-organization SDK key access
- **WHEN** an authenticated user requests SDK keys for an environment outside their organization
- **THEN** the system rejects or hides the project, environment, and SDK keys as not found

### Requirement: User can create an SDK key

The system SHALL allow an authenticated user to create an SDK key for an environment in their organization.

#### Scenario: Successful SDK key creation
- **WHEN** an authenticated user submits a valid SDK key name for an environment in their organization
- **THEN** the system creates the SDK key and returns its id, environment id, name, key prefix, timestamps, revocation state, and full key secret

#### Scenario: Full SDK key is shown once
- **WHEN** an SDK key is returned from creation
- **THEN** the response includes the full key secret exactly for that creation response

#### Scenario: Invalid SDK key name
- **WHEN** an authenticated user submits an empty SDK key name
- **THEN** the system rejects the request without creating an SDK key

### Requirement: SDK key secrets are stored securely

The system SHALL store only a cryptographic hash of SDK key secrets.

#### Scenario: SDK key persistence excludes raw secret
- **WHEN** an SDK key is persisted
- **THEN** the database stores the key hash and key prefix without storing the raw key secret

#### Scenario: SDK key list excludes raw secret
- **WHEN** an authenticated user lists SDK keys
- **THEN** the system returns key metadata without the full key secret or key hash

### Requirement: User can list environment SDK keys

The system SHALL allow an authenticated user to list SDK keys for an environment in their organization.

#### Scenario: Environment SDK key list
- **WHEN** an authenticated user requests SDK keys for an environment in their organization
- **THEN** the system returns that environment's SDK keys ordered by creation date

#### Scenario: Environment with no SDK keys
- **WHEN** an authenticated user requests SDK keys for an environment that has none
- **THEN** the system returns an empty list

### Requirement: User can revoke an SDK key

The system SHALL allow an authenticated user to revoke an SDK key for an environment in their organization.

#### Scenario: Successful SDK key revocation
- **WHEN** an authenticated user revokes an active SDK key in their organization
- **THEN** the system records a revocation timestamp and the key can no longer authenticate SDK requests

#### Scenario: Revoking missing SDK key
- **WHEN** an authenticated user attempts to revoke an SDK key that does not belong to the selected environment
- **THEN** the system rejects or hides the SDK key as not found

### Requirement: Demo workflow can obtain an SDK key

The system SHALL provide a repeatable local path for obtaining a demo SDK key.

#### Scenario: Local key creation path
- **WHEN** a developer runs the local app with seeded demo data
- **THEN** the developer can create or obtain an SDK key for a demo environment without manual database edits

### Requirement: SDK key mutations emit audit events

The system SHALL record audit events after successful SDK key creation and revocation.

#### Scenario: SDK key creation audit
- **WHEN** an authenticated user creates an SDK key
- **THEN** the system records an `SDK_KEY_CREATED` audit event without storing the raw SDK key secret

#### Scenario: SDK key revocation audit
- **WHEN** an authenticated user revokes an SDK key
- **THEN** the system records an `SDK_KEY_REVOKED` audit event with revocation metadata

#### Scenario: SDK key audit context
- **WHEN** the system records an SDK key audit event
- **THEN** the event includes SDK key id, key prefix, environment id, project id, resource name, and actor metadata
