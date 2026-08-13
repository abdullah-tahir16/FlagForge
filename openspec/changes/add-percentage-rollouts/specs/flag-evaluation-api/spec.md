## ADDED Requirements

### Requirement: SDK evaluation accepts context

The system SHALL accept SDK evaluation context request bodies for single-flag and all-flag evaluation.

#### Scenario: Evaluation context includes user id
- **WHEN** an SDK client evaluates flags with a request body containing `userId`
- **THEN** the system uses that user id as the stable rollout identity

#### Scenario: Evaluation context allows future attributes
- **WHEN** an SDK client sends additional primitive context attributes
- **THEN** the system accepts the request without using those attributes for percentage rollout decisions

## MODIFIED Requirements

### Requirement: SDK can evaluate one boolean flag

The system SHALL allow an SDK client to evaluate one boolean flag by flag key for the SDK key's environment, including deterministic percentage rollout behavior.

#### Scenario: Enabled boolean flag with full rollout returns configured value
- **WHEN** an SDK client evaluates an enabled boolean flag with rollout percentage `100` for its environment
- **THEN** the system returns the configured boolean value for that environment

#### Scenario: Disabled boolean flag returns false
- **WHEN** an SDK client evaluates a disabled boolean flag for its environment
- **THEN** the system returns `false` with a disabled reason before applying rollout logic

#### Scenario: Missing flag returns safe default
- **WHEN** an SDK client evaluates a flag key that does not exist in the SDK key's project
- **THEN** the system returns `false` with a not-found reason

#### Scenario: Flag from another project is not evaluated
- **WHEN** an SDK client evaluates a flag key that exists only in another project
- **THEN** the system returns `false` with a not-found reason

#### Scenario: Zero percent rollout returns false
- **WHEN** an SDK client evaluates an enabled boolean flag with rollout percentage `0`
- **THEN** the system returns `false` with percentage rollout reason metadata

#### Scenario: Partial rollout uses deterministic bucket
- **WHEN** an SDK client evaluates an enabled boolean flag with rollout percentage between `1` and `99` and a `userId`
- **THEN** the system computes a deterministic bucket from the environment, flag, and user id and returns the configured value only when the bucket is inside the rollout

#### Scenario: Same user receives stable rollout result
- **WHEN** the same SDK client evaluates the same flag for the same environment and `userId` repeatedly
- **THEN** the system returns the same rollout decision each time

#### Scenario: Partial rollout without user id returns false
- **WHEN** an SDK client evaluates an enabled boolean flag with rollout percentage below `100` without a `userId`
- **THEN** the system returns `false` with missing rollout context reason metadata

### Requirement: SDK can evaluate all boolean flags

The system SHALL allow an SDK client to evaluate all boolean flags for the SDK key's environment, including deterministic percentage rollout behavior.

#### Scenario: Evaluate all returns environment values
- **WHEN** an SDK client requests all flags for an environment
- **THEN** the system returns a map of feature flag keys to evaluated boolean values for that environment

#### Scenario: Disabled flags are included as false
- **WHEN** an SDK client requests all flags and an environment flag configuration is disabled
- **THEN** the system includes that flag key with value `false`

#### Scenario: Project with no flags returns empty map
- **WHEN** an SDK client requests all flags for a project that has no feature flags
- **THEN** the system returns an empty flag map

#### Scenario: Evaluate all applies rollout per flag
- **WHEN** an SDK client requests all flags with a `userId`
- **THEN** the system evaluates each flag's rollout percentage independently and includes each resulting value and reason metadata

#### Scenario: Evaluate all preserves stable rollout decisions
- **WHEN** the same SDK client requests all flags for the same environment and `userId` repeatedly
- **THEN** the system returns the same rollout decisions for each flag each time

### Requirement: Evaluation responses include reason metadata

The system SHALL return reason metadata for SDK evaluation responses.

#### Scenario: Single flag response shape
- **WHEN** an SDK client evaluates one flag
- **THEN** the response includes the flag key, boolean value, reason, and environment metadata safe for clients

#### Scenario: All flags response shape
- **WHEN** an SDK client evaluates all flags
- **THEN** the response includes a flags map and per-flag reason metadata

#### Scenario: Percentage rollout reason
- **WHEN** evaluation uses rollout percentage to decide a flag value
- **THEN** the response reason metadata identifies percentage rollout behavior

#### Scenario: Missing rollout context reason
- **WHEN** evaluation cannot apply a partial rollout because `userId` is missing
- **THEN** the response reason metadata identifies missing rollout context
