## 1. Backend Analytics Schema

- [x] 1.1 Create analytics module structure under `backend/src/analytics/`.
- [x] 1.2 Add `EvaluationEvent` TypeORM entity with organization, project, environment, SDK key, flag key, value, reason, evaluation type, and timestamp fields.
- [x] 1.3 Add a production migration for the analytics event table and useful query indexes.
- [x] 1.4 Register analytics entity/module in the backend application.
- [x] 1.5 Add analytics DTOs/enums for event type, overview filters, and overview responses.

## 2. Backend Analytics Recording

- [x] 2.1 Implement analytics service method for best-effort single event recording.
- [x] 2.2 Implement analytics service method for bulk all-flags event recording.
- [x] 2.3 Wire single-flag evaluation to record one analytics event after evaluation is computed.
- [x] 2.4 Wire all-flags evaluation to record one analytics event per returned flag.
- [x] 2.5 Ensure analytics write failures are caught and do not change SDK evaluation responses.
- [x] 2.6 Ensure persisted analytics events exclude raw SDK keys, raw user ids, and arbitrary context attributes.

## 3. Backend Analytics Read API

- [x] 3.1 Add authenticated project-scoped analytics controller endpoint `GET /api/v1/projects/:projectId/analytics/overview`.
- [x] 3.2 Implement organization/project access control through existing project lookup patterns.
- [x] 3.3 Implement bounded range parsing with a documented default and supported ranges.
- [x] 3.4 Implement optional environment and flag key filters.
- [x] 3.5 Implement aggregation for total evaluations, true count, false count, reason breakdown, top flags, and time buckets.
- [x] 3.6 Return zero/empty metrics for projects with no analytics events in the selected range.

## 4. Frontend Analytics Data Layer

- [x] 4.1 Add analytics domain types under `frontend/src/core/types/Analytics`.
- [x] 4.2 Add analytics API client and transport DTO types under `frontend/src/infrastructure/api/Analytics`.
- [x] 4.3 Add TanStack Query hook for project analytics overview.
- [x] 4.4 Add analytics use-case orchestration for filters, query state, and derived metrics.
- [x] 4.5 Reuse existing project/environment/flag hooks where needed for filter options.

## 5. Frontend Analytics UI

- [x] 5.1 Add project analytics route under `/projects/:projectId/analytics`.
- [x] 5.2 Add project detail/dashboard action linking to analytics.
- [x] 5.3 Add analytics screen in the shared dashboard shell with compact metric panels.
- [x] 5.4 Add token-driven filter controls for environment, flag key, and time range.
- [x] 5.5 Add trend/time bucket, reason breakdown, true/false split, and top flag visual sections using shared primitives and theme tokens.
- [x] 5.6 Add skeleton, alert, and empty states using common dashboard components.
- [x] 5.7 Verify analytics UI at 375px, 1024px, and 1440px without horizontal overflow or incoherent overlap.

## 6. Tests

- [x] 6.1 Add backend tests for analytics event persistence shape and privacy exclusions.
- [x] 6.2 Add backend tests proving single and all-flags evaluations record expected analytics events.
- [x] 6.3 Add backend tests proving analytics write failures do not fail evaluation responses.
- [x] 6.4 Add backend controller/service tests for access control, filters, range parsing, empty metrics, and aggregation results.
- [x] 6.5 Add frontend type/check coverage for analytics API mapping and query hook usage.
- [x] 6.6 Add focused frontend tests or type-level coverage for analytics filter state and derived metrics.

## 7. Documentation

- [x] 7.1 Update `README.md` with analytics behavior, endpoint summary, and local demo notes.
- [x] 7.2 Update `LLM_CONTEXT.md` with durable analytics recording, privacy, and dashboard guidance.
- [x] 7.3 Update `docs/ROADMAP.md` to reflect analytics progress and the next likely CI/Docker polish step.

## 8. Verification

- [x] 8.1 Run `openspec validate add-analytics --strict`.
- [x] 8.2 Run `corepack pnpm build`.
- [x] 8.3 Run `corepack pnpm test`.
- [x] 8.4 Run `corepack pnpm lint`.
- [x] 8.5 Run a local smoke check that evaluates flags and confirms analytics overview metrics update, if feasible.
