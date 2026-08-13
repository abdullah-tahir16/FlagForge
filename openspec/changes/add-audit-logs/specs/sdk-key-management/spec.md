## ADDED Requirements

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
