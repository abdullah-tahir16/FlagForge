# feature-flag-management Specification

## Purpose

Define project-scoped feature flag management, including boolean flags, per-environment configuration, local demo seed behavior, and organization-protected access.
## Requirements
### Requirement: Feature flags are project scoped

The system SHALL scope every feature flag to exactly one project and protect access through the project's organization.

#### Scenario: Flag belongs to project
- **WHEN** an authenticated user creates a feature flag for a project
- **THEN** the system assigns the feature flag to that project

#### Scenario: Cross-organization flag access
- **WHEN** an authenticated user requests a feature flag through a project outside their organization
- **THEN** the system rejects or hides the project and feature flag as not found

### Requirement: User can create a boolean feature flag

The system SHALL allow an authenticated user to create a boolean feature flag with a name and optional description for a project in their organization.

#### Scenario: Successful boolean flag creation
- **WHEN** an authenticated user submits a valid boolean feature flag name for a project in their organization
- **THEN** the system creates the feature flag and returns its id, project id, name, key, type, description, timestamps, and environment configurations

#### Scenario: Duplicate feature flag key in project
- **WHEN** an authenticated user submits a feature flag name that resolves to an existing feature flag key in the same project
- **THEN** the system rejects the request without creating a duplicate feature flag

#### Scenario: Invalid feature flag name
- **WHEN** an authenticated user submits a feature flag name that cannot produce a stable key
- **THEN** the system rejects the request without creating a feature flag

### Requirement: Feature flag creation creates environment configurations

The system SHALL create default environment configurations for every project environment when a boolean feature flag is created.

#### Scenario: Default flag configurations are created
- **WHEN** an authenticated user creates a boolean feature flag for a project with environments
- **THEN** the system creates one configuration per environment with `enabled` false and `value` false

#### Scenario: Feature flag creation is atomic
- **WHEN** environment configuration creation fails during feature flag creation
- **THEN** the system does not persist the feature flag without its configurations

### Requirement: User can list project feature flags

The system SHALL allow an authenticated user to list boolean feature flags for a project in their organization.

#### Scenario: Project feature flag list
- **WHEN** an authenticated user requests feature flags for a project in their organization
- **THEN** the system returns the project's feature flags ordered by creation date with their environment configurations

#### Scenario: Project with no feature flags
- **WHEN** an authenticated user requests feature flags for a project that has none
- **THEN** the system returns an empty list

### Requirement: User can read feature flag details

The system SHALL allow an authenticated user to read a boolean feature flag for a project in their organization.

#### Scenario: Feature flag detail lookup
- **WHEN** an authenticated user requests a feature flag id through its project
- **THEN** the system returns the feature flag and its environment configurations

#### Scenario: Feature flag not in project
- **WHEN** an authenticated user requests a feature flag id through a different project
- **THEN** the system rejects or hides the feature flag as not found

### Requirement: User can update feature flag metadata

The system SHALL allow an authenticated user to update editable metadata for a boolean feature flag in their organization.

#### Scenario: Successful feature flag update
- **WHEN** an authenticated user submits valid updates for a feature flag name or description
- **THEN** the system updates the editable fields and returns the updated feature flag

#### Scenario: Feature flag key remains stable after rename
- **WHEN** an authenticated user changes a feature flag name
- **THEN** the system keeps the feature flag key stable

### Requirement: User can delete a feature flag

The system SHALL allow an authenticated user to delete a boolean feature flag in their organization.

#### Scenario: Successful feature flag deletion
- **WHEN** an authenticated user deletes a feature flag in their organization
- **THEN** the system removes the feature flag and its environment configurations

#### Scenario: Cross-organization feature flag deletion
- **WHEN** an authenticated user attempts to delete a feature flag through a project outside their organization
- **THEN** the system rejects or hides the feature flag as not found

### Requirement: User can configure boolean flag per environment

The system SHALL allow an authenticated user to update enabled state, boolean value, and rollout percentage for a feature flag configuration in a project environment.

#### Scenario: Enable boolean flag in environment
- **WHEN** an authenticated user enables a boolean feature flag configuration for an environment
- **THEN** the system persists `enabled` true for that environment configuration

#### Scenario: Update boolean value in environment
- **WHEN** an authenticated user changes the boolean value for an environment configuration
- **THEN** the system persists the new boolean value for that environment configuration

#### Scenario: Update rollout percentage in environment
- **WHEN** an authenticated user changes rollout percentage for an environment configuration to an integer from 0 through 100
- **THEN** the system persists the new rollout percentage for that environment configuration

#### Scenario: Invalid rollout percentage is rejected
- **WHEN** an authenticated user submits a rollout percentage below 0, above 100, or not an integer
- **THEN** the system rejects the update without changing the environment configuration

#### Scenario: Environment not in project
- **WHEN** an authenticated user updates a feature flag configuration for an environment outside the selected project
- **THEN** the system rejects or hides the environment configuration as not found

### Requirement: Demo seed includes feature flags
The system SHALL seed local demo feature flags, rollout configuration, targeting rules, segments, and segment references for the demo project.

#### Scenario: Seed creates demo feature flags
- **WHEN** a developer runs `pnpm seed`
- **THEN** the demo project contains repeatable boolean feature flags with per-environment configurations

#### Scenario: Seed creates demo rollout configuration
- **WHEN** a developer runs `pnpm seed`
- **THEN** at least one demo feature flag environment configuration has a representative rollout percentage for local dashboard and SDK testing

#### Scenario: Seed creates demo targeting rules
- **WHEN** a developer runs `pnpm seed`
- **THEN** at least one demo feature flag environment configuration has representative ordered targeting rules for local dashboard and SDK testing

#### Scenario: Seed creates demo segments
- **WHEN** a developer runs `pnpm seed`
- **THEN** the demo project contains representative reusable segments and at least one flag environment configuration references a segment

#### Scenario: Seed is idempotent for feature flags
- **WHEN** a developer reruns `pnpm seed`
- **THEN** the seed updates or preserves the demo feature flags, rollout percentages, targeting rules, segments, and segment references without creating duplicates

### Requirement: Feature flag mutations emit audit events

The system SHALL record audit events after successful feature flag creation, update, and deletion.

#### Scenario: Feature flag creation audit
- **WHEN** an authenticated user creates a feature flag
- **THEN** the system records a `FEATURE_FLAG_CREATED` audit event

#### Scenario: Feature flag update audit
- **WHEN** an authenticated user updates feature flag metadata
- **THEN** the system records a `FEATURE_FLAG_UPDATED` audit event with old and new values for changed fields

#### Scenario: Feature flag deletion audit
- **WHEN** an authenticated user deletes a feature flag
- **THEN** the system records a `FEATURE_FLAG_DELETED` audit event before or during deletion so the deleted flag remains identifiable

### Requirement: Environment flag config mutations emit audit events

The system SHALL record audit events after successful per-environment feature flag configuration changes.

#### Scenario: Environment flag config update audit
- **WHEN** an authenticated user updates enabled state, boolean value, or rollout percentage for a feature flag environment configuration
- **THEN** the system records a `FEATURE_FLAG_CONFIG_UPDATED` audit event with old and new values for changed fields

#### Scenario: Environment flag config audit context
- **WHEN** the system records a feature flag config audit event
- **THEN** the event includes feature flag id, project id, environment id, resource name, and actor metadata

### Requirement: Feature flag mutations invalidate evaluation cache
The system SHALL invalidate affected Redis evaluation cache entries after successful feature flag and environment flag configuration mutations.

#### Scenario: Feature flag creation invalidates project environment caches
- **WHEN** an authenticated user creates a feature flag for a project
- **THEN** the system invalidates evaluation cache entries for the project environments that receive default flag configurations

#### Scenario: Feature flag metadata update invalidates environment caches
- **WHEN** an authenticated user updates feature flag metadata that appears in evaluation snapshots
- **THEN** the system invalidates evaluation cache entries for that flag's environment configurations

#### Scenario: Feature flag deletion invalidates environment caches
- **WHEN** an authenticated user deletes a feature flag
- **THEN** the system invalidates evaluation cache entries for the deleted flag's environment configurations

#### Scenario: Environment flag config update invalidates one environment cache
- **WHEN** an authenticated user updates enabled state, boolean value, or rollout percentage for a feature flag environment configuration
- **THEN** the system invalidates the evaluation cache entry for that environment

### Requirement: Feature flag mutations publish realtime configuration events
The system SHALL publish realtime configuration events after successful feature flag and environment flag configuration mutations.

#### Scenario: Feature flag creation publishes event
- **WHEN** an authenticated user creates a feature flag for a project
- **THEN** the system publishes a `CONFIGURATION_CHANGED` event for that project and affected environments

#### Scenario: Feature flag metadata update publishes event
- **WHEN** an authenticated user updates feature flag metadata
- **THEN** the system publishes a `CONFIGURATION_CHANGED` event for that project and the flag's environment configurations

#### Scenario: Feature flag deletion publishes event
- **WHEN** an authenticated user deletes a feature flag
- **THEN** the system publishes a `CONFIGURATION_CHANGED` event for that project and the deleted flag's affected environments

#### Scenario: Environment flag config update publishes event
- **WHEN** an authenticated user updates enabled state, boolean value, or rollout percentage for a feature flag environment configuration
- **THEN** the system publishes a `CONFIGURATION_CHANGED` event for that project and environment

