## 1. Backend Data Model

- [x] 1.1 Add segment and segment condition TypeORM entities with project scope, match mode, ordered conditions, and timestamps.
- [x] 1.2 Add a migration for segment tables, indexes, unique project segment keys, condition ordering, and foreign keys.
- [x] 1.3 Extend targeting rules with condition source and nullable segment reference fields while backfilling existing rules to attribute source.
- [x] 1.4 Add segment, match mode, segment condition, and targeting source enums plus response DTO mapping.
- [x] 1.5 Register segment and updated targeting entities in the relevant backend modules and TypeORM configuration.

## 2. Backend Segment API

- [x] 2.1 Add request DTOs for segment create/update, condition create/update, condition reorder, and segment list pagination.
- [x] 2.2 Add CQRS queries/handlers for paginated segment listing and segment detail lookup.
- [x] 2.3 Add CQRS commands/handlers for segment create, update, and delete with organization ownership and referenced-segment deletion checks.
- [x] 2.4 Add CQRS commands/handlers for segment condition create, update, delete, and reorder with operator-aware validation.
- [x] 2.5 Add authenticated segment controller routes under project path parameters.
- [x] 2.6 Add any bounded segment-options endpoint needed by targeting rule forms without bypassing project authorization.

## 3. Targeting And Evaluation Integration

- [x] 3.1 Reuse the targeting rule matcher for segment condition evaluation and add match-all/match-any segment matcher tests.
- [x] 3.2 Update targeting rule DTOs, service logic, response mapping, and validation for attribute-source and segment-source rules.
- [x] 3.3 Update targeting rule audit snapshots to include condition source and safe segment metadata.
- [x] 3.4 Load segment-source targeting rules and referenced segment conditions for single-flag evaluation.
- [x] 3.5 Load segment-source targeting rules and referenced segment conditions for all-flags evaluation.
- [x] 3.6 Apply segment-source targeting rules before direct attribute rules and rollout fallback.
- [x] 3.7 Extend evaluation reason metadata with safe segment and targeting rule identification.

## 4. Audit And Seed

- [x] 4.1 Add segment and segment condition audit resource/action values and backend filter validation support.
- [x] 4.2 Record audit events for segment create, update, delete, condition create, condition update, condition delete, and condition reorder.
- [x] 4.3 Update frontend audit filter options, labels, row titles, and tones for segment actions/resources.
- [x] 4.4 Extend `pnpm seed` demo data with idempotent representative segments, segment conditions, and segment-source targeting rules.

## 5. Frontend Segment Data Layer

- [x] 5.1 Add segment domain types under `frontend/src/core/types/Segment`.
- [x] 5.2 Add pure segment API functions under `frontend/src/infrastructure/api/Segment`.
- [x] 5.3 Add TanStack Query hooks and mutations for segment list, detail, create, update, delete, condition mutation, and condition reorder.
- [x] 5.4 Add a segment use-case hook for orchestration, cursor pagination, cache invalidation, and form submit handlers.

## 6. Frontend Segment UI

- [x] 6.1 Add React Final Form and Zod schemas for segment metadata and segment condition forms.
- [x] 6.2 Add project segment list and segment detail containers under the shared dashboard shell.
- [x] 6.3 Add dense segment list, segment form, condition manager, empty, loading, error, and destructive confirmation states.
- [x] 6.4 Add Segments navigation with lucide icons, labels, active state, and responsive shell behavior.
- [x] 6.5 Verify segment screens use semantic theme tokens, Common primitives, stable row dimensions, and no raw palette utilities.
- [x] 6.6 Verify segment screens at 375px, 1024px, and 1440px.

## 7. Frontend Targeting UI Integration

- [x] 7.1 Update targeting rule domain and API types for attribute-source and segment-source rules.
- [x] 7.2 Update targeting rule form schemas to validate source-specific fields.
- [x] 7.3 Add segment selection to the flag targeting rule manager while preserving direct attribute rule workflows.
- [x] 7.4 Update targeting rule rows to display segment metadata safely and compactly.
- [x] 7.5 Verify flag detail targeting screens at 375px, 1024px, and 1440px.

## 8. Tests

- [x] 8.1 Add backend unit tests for segment match-all, match-any, empty segment, and condition operator behavior.
- [x] 8.2 Add backend service/API tests for segment list, create, read, update, delete, condition CRUD, reorder, authorization, pagination, and validation failures.
- [x] 8.3 Add backend targeting rule tests for segment-source create/update/list/delete/reorder behavior.
- [x] 8.4 Add backend evaluation tests for segment match, first segment match wins, direct attribute fallback, rollout fallback, disabled flags, and all-flags evaluation.
- [x] 8.5 Add frontend type/test coverage for segment schemas, use-case shape, and key segment UI interactions where the existing frontend test setup supports it.

## 9. Documentation And Verification

- [x] 9.1 Update `README.md`, `LLM_CONTEXT.md`, and `docs/ROADMAP.md` with segment behavior and implementation guidance.
- [x] 9.2 Run `openspec validate add-segments --strict`.
- [x] 9.3 Run `corepack pnpm build`.
- [x] 9.4 Run `corepack pnpm test`.
- [x] 9.5 Run `corepack pnpm lint`.
