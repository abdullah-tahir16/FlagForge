## Context

FlagForge now supports environment-scoped targeting rules for boolean flags. Those rules are useful for one flag at a time, but README segment examples call for reusable cohorts such as Premium Italian Users, Internal Employees, and Beta Testers. Segments need to be project scoped, reusable across flags, and evaluated from SDK context before percentage rollout fallback.

The existing targeting rule operator semantics are already explicit and tested. Segments should reuse those semantics instead of introducing a second condition language.

## Goals / Non-Goals

**Goals:**

- Persist project-scoped segments with stable keys, descriptions, match mode, and ordered conditions.
- Support `MATCH_ALL` and `MATCH_ANY` segment condition evaluation.
- Reuse the targeting operator set and comparison-value validation for segment conditions.
- Allow environment flag targeting rules to reference a segment and return a boolean result when the SDK context belongs to that segment.
- Evaluate segment-reference targeting rules before direct attribute targeting rules and rollout fallback.
- Expose segment management in the dashboard with token-driven Common controls, React Final Form, and Zod.
- Record audit events for segment and segment condition mutations.
- Seed representative segments and segment references for the local demo project.

**Non-Goals:**

- Nested segments.
- Segment versioning or publish workflows.
- Segment import/export.
- Per-environment segment definitions.
- Segment membership snapshots or analytics.
- Regex and semantic-version operators.

## Decisions

### Segments are project scoped

Segments SHALL belong to a project. They are reusable by every flag environment configuration in that project, but not across projects or organizations.

Alternative considered: organization-scoped segments. That would support cross-project reuse, but existing flags, environments, and SDK keys are project-centered. Project scope keeps authorization and evaluation queries simpler for the MVP.

### Segment conditions reuse targeting operators

Segment conditions SHALL store `attribute`, `operator`, `comparisonValue`, and `sortOrder`, using the same operator enum and matcher semantics as direct targeting rules. A segment also stores `matchMode`, either `MATCH_ALL` or `MATCH_ANY`.

Alternative considered: a separate segment expression DSL. That would be more flexible but would duplicate validation, UI, and test surface before there is a need for nested boolean logic.

### Targeting rules reference segments through a typed condition source

Targeting rules SHALL support two condition sources:

- `ATTRIBUTE`: the existing direct attribute condition with `attribute`, `operator`, and `comparisonValue`.
- `SEGMENT`: a segment reference with `segmentId`.

Segment-reference targeting rules remain ordered alongside direct attribute rules and keep the existing `resultValue`.

Alternative considered: add a separate ordered `environment_flag_segment_targets` table. That avoids nullable fields on targeting rules, but it creates two ordered targeting stacks that then need merge logic. One ordered targeting stack is simpler and preserves first-match behavior.

### Segment-reference rules evaluate before direct attributes at the same order boundary

The README evaluation sequence lists segment rules before attribute rules. The implementation SHALL keep one explicit `sortOrder` stack but use the following tie-safe ordering during evaluation:

1. Disabled config short-circuit.
2. Segment-reference targeting rules sorted by `sortOrder`.
3. Direct attribute targeting rules sorted by `sortOrder`.
4. Percentage rollout fallback.
5. Static configured value behavior.

This makes segment targeting predictable and aligns with README ordering while keeping the management UI familiar.

### Segment lists use cursor pagination; condition lists do not

Segment lists can grow over time and SHALL use the shared cursor pagination envelope. Segment condition lists are short, ordered, and must render completely for editing, so they SHALL remain unpaginated.

### Dashboard adds a Segments route

The dashboard SHALL add a Segments navigation item and route under the shared shell. Segment screens follow the existing frontend architecture:

- `core/types/Segment`
- `infrastructure/api/Segment`
- `infrastructure/hooks/Segment`
- `infrastructure/useCases/Segment`
- `presentation/containers/Segments` and segment detail containers
- `presentation/components/Segments`

Forms use React Final Form and Zod through Common controls. The targeting rule form should add a source selector and segment select when project segments exist.

## Risks / Trade-offs

- [Risk] Segment evaluation can add extra joins to SDK evaluation. -> Load only project segments referenced by the evaluated environment's targeting rules and reuse in-memory matching per request.
- [Risk] Segment deletion can leave targeting rules pointing at missing segments. -> Reject deletion while referenced by targeting rules, or cascade to remove segment-reference rules with explicit audit snapshots; prefer reject for MVP.
- [Risk] One targeting rule table now has source-specific fields. -> Validate source-specific DTO combinations and keep response shape explicit.
- [Risk] Segment list pagination can complicate segment selection in targeting forms. -> Use paginated segment management lists, but allow a bounded unpaginated project segment options endpoint if the standard list is insufficient for selection.

## Migration Plan

1. Add `segments` and `segment_conditions` tables.
2. Extend targeting rules with condition source and nullable `segment_id`.
3. Backfill existing targeting rules to `ATTRIBUTE` source.
4. Add audit enum/resource values for segments and segment conditions.
5. Seed demo segments and segment-reference targeting rules idempotently.
6. Rollback removes segment tables and segment-reference targeting columns; existing direct attribute targeting rules remain recoverable from backfilled data if rollback is planned before segment usage.

## Open Questions

- Should deleting a segment be blocked while referenced by targeting rules, or should it delete those segment-reference rules automatically?
- Should the dashboard expose segment selection from a paginated list only, or add a lightweight segment-options endpoint for forms?
