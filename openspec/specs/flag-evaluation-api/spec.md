# flag-evaluation-api Specification

## Purpose

Define SDK-key authenticated feature flag evaluation APIs for external applications.

## Requirements

### Requirement: SDK requests authenticate with SDK keys

The system SHALL authenticate public flag evaluation requests with an SDK key header.

#### Scenario: Valid SDK key authentication
- **WHEN** an SDK request includes a valid active SDK key
- **THEN** the system authenticates the request as that key's environment

#### Scenario: Missing SDK key
- **WHEN** an SDK request omits the SDK key header
- **THEN** the system rejects the request as unauthorized

#### Scenario: Invalid SDK key
- **WHEN** an SDK request includes an unknown SDK key
- **THEN** the system rejects the request as unauthorized

#### Scenario: Revoked SDK key
- **WHEN** an SDK request includes a revoked SDK key
- **THEN** the system rejects the request as unauthorized

### Requirement: SDK can evaluate one boolean flag

The system SHALL allow an SDK client to evaluate one boolean flag by flag key for the SDK key's environment.

#### Scenario: Enabled boolean flag returns configured value
- **WHEN** an SDK client evaluates an enabled boolean flag for its environment
- **THEN** the system returns the configured boolean value for that environment

#### Scenario: Disabled boolean flag returns false
- **WHEN** an SDK client evaluates a disabled boolean flag for its environment
- **THEN** the system returns `false` with a disabled reason

#### Scenario: Missing flag returns safe default
- **WHEN** an SDK client evaluates a flag key that does not exist in the SDK key's project
- **THEN** the system returns `false` with a not-found reason

#### Scenario: Flag from another project is not evaluated
- **WHEN** an SDK client evaluates a flag key that exists only in another project
- **THEN** the system returns `false` with a not-found reason

### Requirement: SDK can evaluate all boolean flags

The system SHALL allow an SDK client to evaluate all boolean flags for the SDK key's environment.

#### Scenario: Evaluate all returns environment values
- **WHEN** an SDK client requests all flags for an environment
- **THEN** the system returns a map of feature flag keys to boolean values for that environment

#### Scenario: Disabled flags are included as false
- **WHEN** an SDK client requests all flags and an environment flag configuration is disabled
- **THEN** the system includes that flag key with value `false`

#### Scenario: Project with no flags returns empty map
- **WHEN** an SDK client requests all flags for a project that has no feature flags
- **THEN** the system returns an empty flag map

### Requirement: Evaluation responses include reason metadata

The system SHALL return reason metadata for SDK evaluation responses.

#### Scenario: Single flag response shape
- **WHEN** an SDK client evaluates one flag
- **THEN** the response includes the flag key, boolean value, reason, and environment metadata safe for clients

#### Scenario: All flags response shape
- **WHEN** an SDK client evaluates all flags
- **THEN** the response includes a flags map and per-flag reason metadata

### Requirement: SDK key usage is tracked

The system SHALL record the last usage time for active SDK keys used by evaluation requests.

#### Scenario: Evaluation updates last used timestamp
- **WHEN** an SDK request authenticates with an active SDK key
- **THEN** the system updates that SDK key's `lastUsedAt` timestamp
