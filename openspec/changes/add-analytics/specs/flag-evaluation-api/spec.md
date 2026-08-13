## ADDED Requirements

### Requirement: SDK evaluations record analytics events

The system SHALL record best-effort analytics events after successful SDK evaluations.

#### Scenario: Single flag evaluation records analytics
- **WHEN** an SDK client successfully evaluates one flag
- **THEN** the evaluation API records one analytics event for that flag result

#### Scenario: All-flags evaluation records analytics
- **WHEN** an SDK client successfully evaluates all flags
- **THEN** the evaluation API records analytics events for every flag result in the response

#### Scenario: Analytics failure does not change evaluation response
- **WHEN** analytics recording fails after evaluation is computed
- **THEN** the evaluation API returns the same response it would have returned without analytics
