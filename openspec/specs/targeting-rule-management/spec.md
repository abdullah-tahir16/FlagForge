# targeting-rule-management Specification

## Purpose

Define environment-scoped targeting rule persistence, management APIs, ordering, validation, operator semantics, and audit behavior for boolean feature flag evaluation.
## Requirements
### Requirement: Targeting rules are environment scoped

The system SHALL scope targeting rules to a feature flag environment configuration and protect access through the owning project organization.

#### Scenario: Rule belongs to environment config
- **WHEN** an authenticated user creates a targeting rule for a feature flag in a project environment
- **THEN** the system assigns the rule to that feature flag's environment configuration

#### Scenario: Cross-organization rule access
- **WHEN** an authenticated user requests targeting rules for a project outside their organization
- **THEN** the system rejects or hides the project, flag, environment, and rules as not found

#### Scenario: Environment not in project
- **WHEN** an authenticated user creates or lists rules for an environment outside the selected project
- **THEN** the system rejects or hides the environment configuration as not found

### Requirement: User can list targeting rules

The system SHALL allow an authenticated user to list targeting rules for a feature flag environment configuration in order.

#### Scenario: Ordered rule list
- **WHEN** an authenticated user requests targeting rules for a feature flag environment configuration in their organization
- **THEN** the system returns all rules ordered by ascending sort order

#### Scenario: Empty rule list
- **WHEN** an authenticated user requests targeting rules for a configuration that has no rules
- **THEN** the system returns an empty list

### Requirement: User can create targeting rules

The system SHALL allow an authenticated user to create a targeting rule with one attribute condition, a supported operator, a comparison value, and a boolean result value.

#### Scenario: Successful rule creation
- **WHEN** an authenticated user submits a valid attribute, operator, comparison value, and result value
- **THEN** the system creates the rule at the end of the ordered rule list and returns its persisted fields

#### Scenario: Invalid attribute name
- **WHEN** an authenticated user submits a blank or invalid attribute name
- **THEN** the system rejects the request without creating a targeting rule

#### Scenario: Unsupported operator
- **WHEN** an authenticated user submits an operator outside the MVP supported operator set
- **THEN** the system rejects the request without creating a targeting rule

#### Scenario: Invalid comparison value for operator
- **WHEN** an authenticated user submits an operator and comparison value combination that cannot be evaluated predictably
- **THEN** the system rejects the request without creating a targeting rule

### Requirement: Targeting rules support MVP operators

The system SHALL support `EQUALS`, `NOT_EQUALS`, `CONTAINS`, `NOT_CONTAINS`, `STARTS_WITH`, `ENDS_WITH`, `IN`, `NOT_IN`, `GREATER_THAN`, `GREATER_THAN_OR_EQUAL`, `LESS_THAN`, and `LESS_THAN_OR_EQUAL` operators.

#### Scenario: Equality operators
- **WHEN** a rule uses `EQUALS` or `NOT_EQUALS`
- **THEN** the system evaluates exact primitive equality or inequality for compatible string, number, or boolean values

#### Scenario: Contains operators
- **WHEN** a rule uses `CONTAINS` or `NOT_CONTAINS`
- **THEN** the system evaluates substring matching for string context values or membership matching for array context values

#### Scenario: Prefix and suffix operators
- **WHEN** a rule uses `STARTS_WITH` or `ENDS_WITH`
- **THEN** the system evaluates the comparison against string context values only

#### Scenario: Inclusion operators
- **WHEN** a rule uses `IN` or `NOT_IN`
- **THEN** the system evaluates whether the context attribute primitive is present in the comparison value array

#### Scenario: Numeric comparison operators
- **WHEN** a rule uses `GREATER_THAN`, `GREATER_THAN_OR_EQUAL`, `LESS_THAN`, or `LESS_THAN_OR_EQUAL`
- **THEN** the system evaluates the comparison only when both context and comparison values are numeric

### Requirement: User can update targeting rules

The system SHALL allow an authenticated user to update editable fields of an existing targeting rule.

#### Scenario: Successful rule update
- **WHEN** an authenticated user submits valid edits for a targeting rule in their organization
- **THEN** the system persists the edited attribute, operator, comparison value, or result value and returns the updated rule

#### Scenario: Rule not in environment config
- **WHEN** an authenticated user updates a rule through a different feature flag environment configuration
- **THEN** the system rejects or hides the rule as not found

### Requirement: User can delete targeting rules

The system SHALL allow an authenticated user to delete a targeting rule from a feature flag environment configuration.

#### Scenario: Successful rule deletion
- **WHEN** an authenticated user deletes a targeting rule in their organization
- **THEN** the system removes the rule and preserves a valid order for remaining rules

#### Scenario: Delete missing rule
- **WHEN** an authenticated user deletes a targeting rule that does not exist in the selected configuration
- **THEN** the system rejects or hides the rule as not found

### Requirement: User can reorder targeting rules

The system SHALL allow an authenticated user to reorder the full targeting rule list for a feature flag environment configuration.

#### Scenario: Successful reorder
- **WHEN** an authenticated user submits every rule id for the configuration in a new order
- **THEN** the system persists contiguous sort order values matching that order

#### Scenario: Reorder with missing rule id
- **WHEN** an authenticated user submits a reorder payload that omits an existing rule id for the configuration
- **THEN** the system rejects the reorder without changing rule order

#### Scenario: Reorder with foreign rule id
- **WHEN** an authenticated user submits a reorder payload containing a rule id outside the selected configuration
- **THEN** the system rejects the reorder without changing rule order

### Requirement: Targeting rule mutations emit audit events

The system SHALL record audit events after successful targeting rule creation, update, deletion, and reorder.

#### Scenario: Rule creation audit
- **WHEN** an authenticated user creates a targeting rule
- **THEN** the system records a `TARGETING_RULE_CREATED` audit event

#### Scenario: Rule update audit
- **WHEN** an authenticated user updates a targeting rule
- **THEN** the system records a `TARGETING_RULE_UPDATED` audit event with old and new values for changed fields

#### Scenario: Rule deletion audit
- **WHEN** an authenticated user deletes a targeting rule
- **THEN** the system records a `TARGETING_RULE_DELETED` audit event before or during deletion so the deleted rule remains identifiable

#### Scenario: Rule reorder audit
- **WHEN** an authenticated user reorders targeting rules
- **THEN** the system records a `TARGETING_RULE_REORDERED` audit event with old and new rule order snapshots

### Requirement: Targeting rules can reference segments
The system SHALL allow environment-scoped targeting rules to reference reusable project segments as a condition source.

#### Scenario: Successful segment targeting rule creation
- **WHEN** an authenticated user creates a targeting rule that references a segment in the same project
- **THEN** the system creates an ordered targeting rule with segment source and boolean result value

#### Scenario: Segment targeting rule uses same project
- **WHEN** an authenticated user creates or updates a targeting rule with a segment id outside the selected project
- **THEN** the system rejects the request without changing targeting rules

#### Scenario: Segment source excludes direct attribute fields
- **WHEN** an authenticated user creates a segment-source targeting rule
- **THEN** the system validates the segment id and does not require attribute, operator, or comparison value fields

#### Scenario: Attribute source preserves existing validation
- **WHEN** an authenticated user creates an attribute-source targeting rule
- **THEN** the system validates attribute, operator, and comparison value fields using existing targeting rule rules

#### Scenario: Segment rule response
- **WHEN** the system returns targeting rules
- **THEN** segment-source rules include safe segment id, name, and key metadata for dashboard rendering

### Requirement: Targeting rule mutations invalidate evaluation cache
The system SHALL invalidate affected Redis evaluation cache entries after successful targeting rule mutations.

#### Scenario: Targeting rule creation invalidates environment cache
- **WHEN** an authenticated user creates a targeting rule for a feature flag environment configuration
- **THEN** the system invalidates the evaluation cache entry for that environment

#### Scenario: Targeting rule update invalidates environment cache
- **WHEN** an authenticated user updates a targeting rule
- **THEN** the system invalidates the evaluation cache entry for that rule's environment

#### Scenario: Targeting rule deletion invalidates environment cache
- **WHEN** an authenticated user deletes a targeting rule
- **THEN** the system invalidates the evaluation cache entry for that rule's environment

#### Scenario: Targeting rule reorder invalidates environment cache
- **WHEN** an authenticated user reorders targeting rules
- **THEN** the system invalidates the evaluation cache entry for that rule stack's environment

### Requirement: Targeting rule mutations publish realtime configuration events
The system SHALL publish realtime configuration events after successful targeting rule mutations.

#### Scenario: Targeting rule creation publishes event
- **WHEN** an authenticated user creates a targeting rule for a feature flag environment configuration
- **THEN** the system publishes a `CONFIGURATION_CHANGED` event for that project and environment

#### Scenario: Targeting rule update publishes event
- **WHEN** an authenticated user updates a targeting rule
- **THEN** the system publishes a `CONFIGURATION_CHANGED` event for that project and environment

#### Scenario: Targeting rule deletion publishes event
- **WHEN** an authenticated user deletes a targeting rule
- **THEN** the system publishes a `CONFIGURATION_CHANGED` event for that project and environment

#### Scenario: Targeting rule reorder publishes event
- **WHEN** an authenticated user reorders targeting rules
- **THEN** the system publishes a `CONFIGURATION_CHANGED` event for that project and environment

