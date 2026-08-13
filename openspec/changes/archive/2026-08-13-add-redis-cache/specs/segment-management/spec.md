## ADDED Requirements

### Requirement: Segment mutations invalidate referenced evaluation caches
The system SHALL invalidate Redis evaluation cache entries for environments whose targeting rules reference a mutated segment.

#### Scenario: Segment metadata update invalidates referenced environments
- **WHEN** an authenticated user updates segment metadata or match mode for a segment referenced by targeting rules
- **THEN** the system invalidates evaluation cache entries for every environment that references that segment

#### Scenario: Segment condition creation invalidates referenced environments
- **WHEN** an authenticated user creates a condition on a segment referenced by targeting rules
- **THEN** the system invalidates evaluation cache entries for every environment that references that segment

#### Scenario: Segment condition update invalidates referenced environments
- **WHEN** an authenticated user updates a condition on a segment referenced by targeting rules
- **THEN** the system invalidates evaluation cache entries for every environment that references that segment

#### Scenario: Segment condition deletion invalidates referenced environments
- **WHEN** an authenticated user deletes a condition from a segment referenced by targeting rules
- **THEN** the system invalidates evaluation cache entries for every environment that references that segment

#### Scenario: Segment condition reorder invalidates referenced environments
- **WHEN** an authenticated user reorders conditions on a segment referenced by targeting rules
- **THEN** the system invalidates evaluation cache entries for every environment that references that segment

#### Scenario: Unreferenced segment mutation avoids unnecessary invalidation
- **WHEN** an authenticated user mutates a segment that is not referenced by any targeting rule
- **THEN** the system does not need to delete any environment evaluation cache entries
