# js-sdk-client Specification

## Purpose
TBD - created by archiving change add-js-sdk. Update Purpose after archive.
## Requirements
### Requirement: SDK package is installable as a workspace library

The system SHALL provide a first-party JavaScript SDK package named `@flagforge/js-sdk`.

#### Scenario: SDK package metadata exists
- **WHEN** a developer inspects the JavaScript SDK package
- **THEN** package metadata identifies the package as `@flagforge/js-sdk`

#### Scenario: SDK package builds distributable output
- **WHEN** a developer runs the SDK build command
- **THEN** the package produces JavaScript output and TypeScript declaration files for consumers

### Requirement: SDK client can evaluate one boolean flag

The SDK SHALL expose a client method for evaluating one boolean flag by key using an environment SDK key.

#### Scenario: Single flag request uses SDK key header
- **WHEN** an SDK consumer evaluates one flag with a configured SDK key
- **THEN** the SDK sends the request with the `X-FlagForge-Key` header

#### Scenario: Single flag request sends evaluation context
- **WHEN** an SDK consumer evaluates one flag with `userId` and primitive context attributes
- **THEN** the SDK sends those values in the evaluation request body

#### Scenario: isEnabled returns evaluated value
- **WHEN** the evaluation API returns a successful boolean value for a flag
- **THEN** `isEnabled` resolves to that boolean value

#### Scenario: Detailed evaluation returns reason metadata
- **WHEN** the evaluation API returns reason metadata for a flag
- **THEN** the SDK detailed evaluation method exposes the flag key, value, reason, environment metadata, and safe targeting metadata returned by the API

### Requirement: SDK client can evaluate all boolean flags

The SDK SHALL expose a client method for evaluating all boolean flags for the SDK key's environment.

#### Scenario: All flags request uses SDK key header
- **WHEN** an SDK consumer evaluates all flags with a configured SDK key
- **THEN** the SDK sends the request with the `X-FlagForge-Key` header

#### Scenario: All flags request sends evaluation context
- **WHEN** an SDK consumer evaluates all flags with `userId` and primitive context attributes
- **THEN** the SDK sends those values in the evaluation request body

#### Scenario: All flags response exposes values and reasons
- **WHEN** the evaluation API returns all flag values and reason metadata
- **THEN** the SDK exposes the flags map and per-flag reasons to the consumer

### Requirement: SDK fails safely

The SDK SHALL return safe fallback values when evaluation cannot complete successfully.

#### Scenario: Single flag network failure returns default
- **WHEN** a single flag evaluation request fails because the network or server is unavailable
- **THEN** `isEnabled` resolves to the caller-provided default value or `false`

#### Scenario: Single flag unauthorized response returns default
- **WHEN** a single flag evaluation request returns an unauthorized response
- **THEN** `isEnabled` resolves to the caller-provided default value or `false`

#### Scenario: Single flag malformed response returns default
- **WHEN** a single flag evaluation response cannot be parsed as the expected SDK response shape
- **THEN** `isEnabled` resolves to the caller-provided default value or `false`

#### Scenario: All flags failure returns empty map
- **WHEN** an all-flags evaluation request fails because the network, server, authentication, or response shape is invalid
- **THEN** the SDK returns an empty flags map and no per-flag reasons unless the caller supplied fallback values

### Requirement: SDK supports configurable transport

The SDK SHALL allow consumers to configure the API base URL, SDK key, request timeout, and fetch implementation.

#### Scenario: Client uses configured API base URL
- **WHEN** an SDK consumer creates a client with a custom API base URL
- **THEN** evaluation requests are sent to that base URL

#### Scenario: Client can use injected fetch
- **WHEN** an SDK consumer creates a client with a compatible fetch implementation
- **THEN** the SDK uses that fetch implementation for evaluation requests

#### Scenario: Request timeout applies to evaluations
- **WHEN** an evaluation request exceeds the configured timeout
- **THEN** the SDK aborts the request and returns the configured safe fallback

### Requirement: SDK exposes TypeScript types

The SDK SHALL export public TypeScript types for client options, evaluation context, evaluation responses, reasons, and fallback options.

#### Scenario: Consumer imports SDK types
- **WHEN** a TypeScript consumer imports public SDK types
- **THEN** the package resolves those types from its declaration output

#### Scenario: Evaluation context type allows primitive attributes
- **WHEN** a TypeScript consumer creates an evaluation context with `userId` and primitive attributes
- **THEN** the SDK types accept that context without requiring application-specific schemas

### Requirement: SDK documentation covers local usage

The system SHALL document how to use the JavaScript SDK against the local FlagForge API.

#### Scenario: README includes SDK client example
- **WHEN** a developer reads the project documentation
- **THEN** the documentation shows creating a client with the local API URL and demo SDK key

#### Scenario: README includes single flag check
- **WHEN** a developer reads the SDK usage example
- **THEN** the documentation shows checking `new-checkout` with a user context

