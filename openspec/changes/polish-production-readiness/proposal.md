## Why

A pre-launch review surfaced stale documentation, dead code, misleading UI copy, and a missing API reference that undermine the "production ready" claim. Several of these are not cosmetic: a confirmation dialog mislabels the action being confirmed, an audit pagination label misrepresents totals, and a segment count badge is broken. These need to be fixed together with the surrounding cleanup so the product, its docs, and its API reference all tell the same true story.

## What Changes

- Remove the frontend health-check polling/UI: `useHealth`, `useAppUseCase`'s `apiStatus`/`isCheckingApi`/`isApiAvailable`/`apiServiceName`, the `StatusBadge` component, and every prop/spread threading them through 9 feature hooks and 12 containers. **BREAKING** for any code relying on `useAppUseCase`'s current shape. The backend `/health` endpoint itself is unaffected (Docker healthchecks and `scripts/smoke-local.mjs` depend on it).
- Remove confirmed backend dead code: `AnalyticsService.recordEvaluation` (unreachable singular method), the unused `cookie` npm dependency.
- Decide and apply a resolution for `FeatureFlagType`: either commit to boolean-only flags and simplify the enum/display, or explicitly document it as intentional future-proofing — either way, stop rendering it as a meaningful one-value "type" badge in the UI.
- Fix real UI bugs found during review:
  - `ConfirmDialog` always shows "Deleting" while confirming, regardless of the actual action (e.g. revoking an SDK key shows "Deleting").
  - `ProjectSegmentList` segment-count pluralization is a no-op (`"visible" : "visible"`) and uses the wrong word; align with the `"N segments"` pattern used elsewhere.
  - Audit pagination label reports the fixed page size as if it were the total record count (always "25 of 25 shown").
  - Audit entries render raw UUIDs for project/environment instead of resolved names.
  - Remove the two decorative "fake data" progress bars (Home dashboard cards, Auth screen highlight list) that are hardcoded to fixed positions regardless of real data.
  - Remove the hardcoded demo credentials shown permanently in the Login/Register UI, or gate them so they cannot render outside local development.
- Align terminology: standardize on "Organization" (not "Workspace"/"Local workspace") and "flag" vs "feature flag" consistently; standardize loading-state button verbs (`Saving`/`Creating`/`Deleting`/`Revoking` with ellipses) including the Auth forms' outlier "Please wait".
- Remove the dead-end disabled "Environments" top-level nav item (environments are only ever managed from within a project).
- Consolidate duplicated `TargetingRules`/`Segments` operator, formatting, and comparison-parsing logic into a shared utility.
- Align `infrastructure/api/SdkKey/types.ts` with the `extends CoreType {}` pattern used by every sibling API types file.
- Add OpenAPI/Swagger documentation to the backend: wire up `@nestjs/swagger`, annotate controllers and DTOs, expose `/api/docs`, and document the authentication scheme used by protected routes.
- Restructure `README.md`: remove or clearly separate the ~3,700-line aspirational planning section from the accurate operational section, and add a real "Features" summary reflecting what's actually implemented (segments, targeting rules, analytics, realtime SSE, audit logs, RBAC).
- Archive the already-complete `add-ci-and-docker-polish` change and correct the two stale rows in `docs/ROADMAP.md` (mark it archived; mark `add-dashboard-flag-management` as delivered/absorbed rather than "Planned").

## Capabilities

### New Capabilities
- `openapi-documentation`: NestJS Swagger/OpenAPI documentation generation, served at `/api/docs`, covering all management and evaluation controllers with authenticated-route documentation.

### Modified Capabilities
- `dashboard-ui-foundation`: removes the health-check status UI, fixes the mislabeled confirm-dialog action text, prohibits decorative non-data UI elements (including single-value badges dressed as metadata, such as the current flag "type" badge), standardizes terminology and loading-state copy, and removes the dead-end "Environments" nav item.
- `audit-log-management`: audit entries must display resolved resource names (not raw UUIDs) and pagination summaries must reflect actual result totals, not the fixed page size.

## Impact

- Frontend: `infrastructure/{api,hooks,useCases}/App/*`, `core/types/App/*`, `presentation/components/{AppShell,Common/StatusBadge,Common/ConfirmDialog}`, `presentation/containers/*` (12 files), `presentation/hooks/*Feature.ts` (9 files), `presentation/components/{Auth,Segments/ProjectSegmentList,Audit,FeatureFlags}`, `presentation/hooks/{TargetingRules,Segments}/{data,fns}.ts`.
- Backend: `src/analytics/analytics.service.ts`, `package.json` (remove `cookie`), `src/feature-flags/*` (type-handling decision), new `@nestjs/swagger` dependency and bootstrap wiring in `main.ts`, `@Api*` decorators across ~12 controllers and their DTOs.
- Docs: `README.md` restructure, `docs/ROADMAP.md` correction.
- OpenSpec: archive `add-ci-and-docker-polish`.
