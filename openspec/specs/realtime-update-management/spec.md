# realtime-update-management Specification

## Purpose
TBD - created by archiving change add-realtime-updates. Update Purpose after archive.
## Requirements
### Requirement: Dashboard clients can subscribe to realtime events
The system SHALL expose an authenticated backend stream for dashboard realtime events.

#### Scenario: Authenticated subscription opens
- **WHEN** an authenticated dashboard client opens the realtime stream with a valid access token
- **THEN** the backend registers the client for events scoped to the user's organization

#### Scenario: Unauthenticated subscription is rejected
- **WHEN** a dashboard client opens the realtime stream without a valid access token
- **THEN** the backend rejects the stream without registering a subscriber

#### Scenario: Subscription closes cleanly
- **WHEN** a dashboard client disconnects or logs out
- **THEN** the backend removes that subscriber without affecting other subscribers

### Requirement: Realtime events use a stable envelope
The system SHALL publish realtime events using a stable JSON envelope suitable for frontend query invalidation.

#### Scenario: Configuration event envelope
- **WHEN** a configuration mutation publishes a realtime event
- **THEN** the event includes id, type, organization id, project id, optional environment ids, resource type, resource id, action, and occurrence timestamp

#### Scenario: Event type identifies configuration changes
- **WHEN** a feature flag, environment config, targeting rule, segment, or segment condition mutation changes dashboard-visible configuration
- **THEN** the event type is `CONFIGURATION_CHANGED`

### Requirement: Realtime delivery is organization scoped
The system SHALL deliver realtime events only to subscribers whose organization owns the changed resource.

#### Scenario: Matching organization receives event
- **WHEN** a mutation publishes an event for a subscriber's organization
- **THEN** that subscriber receives the event

#### Scenario: Other organizations do not receive event
- **WHEN** a mutation publishes an event for a different organization
- **THEN** the subscriber does not receive the event

### Requirement: Realtime publishing is best effort
The system SHALL treat realtime publishing as optional notification infrastructure and not mutation correctness infrastructure.

#### Scenario: No subscribers connected
- **WHEN** a management mutation publishes a realtime event and no clients are connected
- **THEN** the mutation still succeeds

#### Scenario: Publish failure is tolerated
- **WHEN** realtime publishing fails after a successful management mutation
- **THEN** the mutation still succeeds and the failure is handled without exposing raw stream details to API clients

### Requirement: Realtime stream keeps connections alive
The system SHALL keep active realtime stream connections usable for normal dashboard sessions.

#### Scenario: Heartbeat is sent
- **WHEN** a dashboard client remains connected without events for a configured interval
- **THEN** the backend sends a heartbeat frame or comment to keep the stream active

#### Scenario: Client reconnects after interruption
- **WHEN** the frontend realtime stream disconnects while the user remains authenticated
- **THEN** the frontend attempts to reconnect with bounded backoff

