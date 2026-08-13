## ADDED Requirements

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
