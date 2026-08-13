## 1. Backend Data Model

- [x] 1.1 Add a TypeORM targeting rule entity scoped to environment flag configuration with attribute, operator, comparison value, result value, sort order, and timestamps.
- [x] 1.2 Add a migration for the targeting rule table, foreign key, ordering index, and cascade behavior matching feature flag config deletion.
- [x] 1.3 Add targeting rule domain enums and response DTO mapping with no raw string duplication across handlers.
- [x] 1.4 Register the targeting rule entity in the relevant backend module and TypeORM configuration.

## 2. Backend Rule Management API

- [x] 2.1 Add request DTOs for create, update, and reorder with operator-aware validation for comparison values.
- [x] 2.2 Add CQRS commands/queries and handlers for listing ordered rules by project, flag, and environment.
- [x] 2.3 Add CQRS commands/handlers for creating rules at the end of the ordered list.
- [x] 2.4 Add CQRS commands/handlers for updating rule fields while enforcing organization ownership.
- [x] 2.5 Add CQRS commands/handlers for deleting rules and preserving contiguous sort order.
- [x] 2.6 Add CQRS commands/handlers for full-list reorder with transaction protection and validation for missing or foreign rule ids.
- [x] 2.7 Add authenticated management controller routes under project, flag, and environment path parameters.

## 3. Evaluation Integration

- [x] 3.1 Implement a pure targeting rule matcher covering all MVP operators and missing/invalid context behavior.
- [x] 3.2 Load ordered targeting rules for single-flag evaluation and evaluate them before percentage rollout fallback.
- [x] 3.3 Load ordered targeting rules for all-flags evaluation and apply targeting independently per flag.
- [x] 3.4 Extend evaluation reason metadata with targeting-rule-match information safe for SDK clients.
- [x] 3.5 Ensure disabled flags still return false before targeting or rollout evaluation.

## 4. Audit And Seed

- [x] 4.1 Add targeting rule audit resource/action values and include them in backend filter validation.
- [x] 4.2 Record audit events for targeting rule create, update, delete, and reorder operations with safe snapshots.
- [x] 4.3 Update frontend audit filter options and audit row labels for targeting rule actions/resources.
- [x] 4.4 Extend `pnpm seed` demo data with idempotent representative targeting rules for the demo project.

## 5. Frontend Data Layer

- [x] 5.1 Add targeting rule domain types under `frontend/src/core/types/TargetingRules`.
- [x] 5.2 Add pure API functions under `frontend/src/infrastructure/api/TargetingRules`.
- [x] 5.3 Add TanStack Query hooks and mutations for list, create, update, delete, and reorder operations.
- [x] 5.4 Add a targeting rule use-case hook for orchestration, cache invalidation, optimistic-safe reorder state, and form submit handlers.

## 6. Frontend UI

- [x] 6.1 Add React Final Form and Zod schemas for targeting rule create/edit forms.
- [x] 6.2 Build shared or feature-local form controls for operator selection, comparison value input, and boolean result selection using Common primitives.
- [x] 6.3 Add a compact targeting rule manager to the feature flag detail environment configuration surface.
- [x] 6.4 Add rule create, edit, delete, and reorder interactions with themed alerts, skeletons, empty states, and confirmation dialogs.
- [x] 6.5 Verify the rule manager uses semantic theme tokens, lucide icons, stable row dimensions, and no nested cards or raw palette utilities.
- [x] 6.6 Verify responsive behavior at 375px, 1024px, and 1440px for flag detail screens with targeting controls.

## 7. Tests

- [x] 7.1 Add backend unit tests for every targeting rule operator and missing/invalid context behavior.
- [x] 7.2 Add backend API tests for rule list, create, update, delete, reorder, authorization, and validation failures.
- [x] 7.3 Add backend evaluation tests for targeting match, first-match-wins, no-match rollout fallback, disabled flags, and all-flags evaluation.
- [x] 7.4 Add frontend tests for targeting rule form validation and rule manager interactions where the existing frontend test setup supports it.

## 8. Documentation And Verification

- [x] 8.1 Update `README.md`, `LLM_CONTEXT.md`, and `docs/ROADMAP.md` with targeting rule behavior and implementation guidance.
- [x] 8.2 Run `openspec validate add-targeting-rules --strict`.
- [x] 8.3 Run `corepack pnpm build`.
- [x] 8.4 Run `corepack pnpm test`.
- [x] 8.5 Run `corepack pnpm lint`.
