## MODIFIED Requirements

### Requirement: SDK can evaluate one boolean flag
The system SHALL allow an SDK client to evaluate one boolean flag by flag key for the SDK key's environment, including segment targeting rules, direct attribute targeting rules, and deterministic percentage rollout behavior.

#### Scenario: Enabled boolean flag with full rollout returns configured value
- **WHEN** an SDK client evaluates an enabled boolean flag with no matching segment or attribute targeting rule and rollout percentage `100` for its environment
- **THEN** the system returns the configured boolean value for that environment

#### Scenario: Disabled boolean flag returns false
- **WHEN** an SDK client evaluates a disabled boolean flag for its environment
- **THEN** the system returns `false` with a disabled reason before applying segment targeting, attribute targeting, or rollout logic

#### Scenario: Missing flag returns safe default
- **WHEN** an SDK client evaluates a flag key that does not exist in the SDK key's project
- **THEN** the system returns `false` with a not-found reason

#### Scenario: Flag from another project is not evaluated
- **WHEN** an SDK client evaluates a flag key that exists only in another project
- **THEN** the system returns `false` with a not-found reason

#### Scenario: Matching segment targeting rule returns rule value
- **WHEN** an SDK client evaluates an enabled boolean flag and the evaluation context matches a referenced segment
- **THEN** the system returns that segment targeting rule result value before applying direct attribute targeting or percentage rollout logic

#### Scenario: Matching targeting rule returns rule value
- **WHEN** an SDK client evaluates an enabled boolean flag and the first matching direct attribute targeting rule returns `true` or `false`
- **THEN** the system returns that rule result value before applying percentage rollout logic

#### Scenario: First matching segment targeting rule wins
- **WHEN** multiple enabled segment targeting rules match the same evaluation context
- **THEN** the system returns the result value from the matching segment targeting rule with the lowest sort order

#### Scenario: No matching targeting rule falls back to rollout
- **WHEN** an SDK client evaluates an enabled boolean flag and no segment or attribute targeting rule matches
- **THEN** the system applies the existing percentage rollout behavior for that environment configuration

#### Scenario: Zero percent rollout returns false
- **WHEN** an SDK client evaluates an enabled boolean flag with no matching targeting rule and rollout percentage `0`
- **THEN** the system returns `false` with percentage rollout reason metadata

#### Scenario: Partial rollout uses deterministic bucket
- **WHEN** an SDK client evaluates an enabled boolean flag with no matching targeting rule, rollout percentage between `1` and `99`, and a `userId`
- **THEN** the system computes a deterministic bucket from the environment, flag, and user id and returns the configured value only when the bucket is inside the rollout

#### Scenario: Same user receives stable rollout result
- **WHEN** the same SDK client evaluates the same flag for the same environment and `userId` repeatedly
- **THEN** the system returns the same rollout decision each time

#### Scenario: Partial rollout without user id returns false
- **WHEN** an SDK client evaluates an enabled boolean flag with no matching targeting rule and rollout percentage below `100` without a `userId`
- **THEN** the system returns `false` with missing rollout context reason metadata

### Requirement: SDK can evaluate all boolean flags
The system SHALL allow an SDK client to evaluate all boolean flags for the SDK key's environment, including segment targeting rules, direct attribute targeting rules, and deterministic percentage rollout behavior.

#### Scenario: Evaluate all returns environment values
- **WHEN** an SDK client requests all flags for an environment
- **THEN** the system returns a map of feature flag keys to boolean values for that environment

#### Scenario: Disabled flags are included as false
- **WHEN** an SDK client requests all flags and an environment flag configuration is disabled
- **THEN** the system includes that flag key with value `false`

#### Scenario: Project with no flags returns empty map
- **WHEN** an SDK client requests all flags for a project that has no feature flags
- **THEN** the system returns an empty flag map

#### Scenario: Evaluate all applies segment targeting per flag
- **WHEN** an SDK client requests all flags with context attributes matching referenced segments
- **THEN** the system evaluates each flag's ordered segment targeting rules independently and includes each resulting value and reason metadata

#### Scenario: Evaluate all applies targeting per flag
- **WHEN** an SDK client requests all flags with context attributes matching direct targeting rules and no matching segment targeting rule for a flag
- **THEN** the system evaluates each flag's ordered direct targeting rules independently and includes each resulting value and reason metadata

#### Scenario: Evaluate all applies rollout per flag
- **WHEN** an SDK client requests all flags with a `userId` and no matching targeting rule for a flag
- **THEN** the system evaluates that flag's rollout percentage independently and includes its resulting value and reason metadata

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

#### Scenario: Segment targeting reason
- **WHEN** evaluation returns a value because a referenced segment matched
- **THEN** the response reason metadata identifies segment targeting behavior and includes safe segment and rule identification metadata

#### Scenario: Targeting rule reason
- **WHEN** evaluation returns a value because a direct targeting rule matched
- **THEN** the response reason metadata identifies targeting rule behavior and includes safe rule identification metadata

#### Scenario: Percentage rollout reason
- **WHEN** evaluation uses rollout percentage to decide a flag value
- **THEN** the response reason metadata identifies percentage rollout behavior

#### Scenario: Missing rollout context reason
- **WHEN** evaluation cannot apply a partial rollout because `userId` is missing
- **THEN** the response reason metadata identifies missing rollout context
