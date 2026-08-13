## ADDED Requirements

### Requirement: Backend can connect to Redis for evaluation caching
The system SHALL provide backend Redis configuration for evaluation cache operations.

#### Scenario: Redis configuration is present
- **WHEN** the backend starts with Redis environment variables configured
- **THEN** the backend initializes a Redis client for evaluation cache reads, writes, and invalidation

#### Scenario: Redis configuration is absent
- **WHEN** the backend starts without Redis environment variables configured
- **THEN** the backend disables cache operations without preventing API startup

### Requirement: Evaluation cache stores environment snapshots
The system SHALL cache complete evaluable environment flag configuration snapshots in Redis.

#### Scenario: Environment snapshot cache write
- **WHEN** evaluation loads an environment configuration snapshot from PostgreSQL after a cache miss
- **THEN** the system writes a versioned JSON cache entry containing environment metadata, flags, environment configs, targeting rules, referenced segments, and segment conditions

#### Scenario: Cache entry has bounded lifetime
- **WHEN** the system writes an environment snapshot cache entry
- **THEN** Redis stores it with the configured cache TTL

#### Scenario: Cache keys are environment scoped
- **WHEN** the system stores an evaluation cache entry
- **THEN** the cache key identifies the cache namespace version and environment id

### Requirement: Evaluation cache falls back safely
The system SHALL treat Redis as optional performance infrastructure and preserve correctness through PostgreSQL fallback.

#### Scenario: Cache miss falls back to database
- **WHEN** an SDK evaluation request has no Redis snapshot for the SDK key environment
- **THEN** the system loads the snapshot from PostgreSQL and evaluates normally

#### Scenario: Redis outage falls back to database
- **WHEN** Redis is unavailable or returns an operation error during evaluation
- **THEN** the system loads the required data from PostgreSQL and returns the normal evaluation response

#### Scenario: Invalid cache payload falls back to database
- **WHEN** a Redis cache entry cannot be parsed or has an unsupported cache schema version
- **THEN** the system ignores the entry, loads from PostgreSQL, and attempts to replace the cache entry

### Requirement: Evaluation cache can be invalidated
The system SHALL expose backend cache invalidation operations for affected environment snapshots.

#### Scenario: Invalidate one environment
- **WHEN** a management mutation changes data that affects one environment's evaluation result
- **THEN** the system deletes that environment's evaluation cache entry

#### Scenario: Invalidate many environments
- **WHEN** a management mutation changes data that affects multiple environment snapshots
- **THEN** the system deletes every affected environment cache entry

#### Scenario: Invalidation tolerates Redis errors
- **WHEN** Redis fails during cache invalidation after a successful management mutation
- **THEN** the mutation still succeeds and the error is handled without exposing raw Redis details to the client

### Requirement: Cache behavior is testable
The system SHALL provide automated backend coverage for evaluation cache behavior.

#### Scenario: Cache hit test
- **WHEN** a valid environment snapshot exists in Redis
- **THEN** backend tests verify evaluation can use that snapshot without querying the full evaluation graph from PostgreSQL

#### Scenario: Cache miss test
- **WHEN** no environment snapshot exists in Redis
- **THEN** backend tests verify evaluation loads from PostgreSQL and writes a cache entry

#### Scenario: Invalidation test
- **WHEN** a management mutation changes evaluable configuration
- **THEN** backend tests verify affected environment cache keys are invalidated
