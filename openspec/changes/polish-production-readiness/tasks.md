## 1. OpenSpec Bookkeeping

- [x] 1.1 Archive the completed `add-ci-and-docker-polish` change (`openspec archive add-ci-and-docker-polish` or `/opsx:archive`).
- [x] 1.2 Update `docs/ROADMAP.md` row 15 to reflect the archived status of `add-ci-and-docker-polish`.
- [x] 1.3 Update `docs/ROADMAP.md` row 6 (`add-dashboard-flag-management`) to reflect that it was delivered/absorbed into other changes rather than "Planned".

## 2. Backend Dead Code Removal

- [x] 2.1 Remove `AnalyticsService.recordEvaluation` (singular) from `backend/src/analytics/analytics.service.ts` — confirm no remaining callers.
- [x] 2.2 Remove the unused `cookie` dependency from `backend/package.json` and its lockfile entry; confirm `cookie-parser` still works.
- [x] 2.3 Document the `FeatureFlagType` single-value enum as intentional future-proofing (a short code comment on the enum, not a spec doc) rather than removing it.

## 3. Backend: Audit Log Name Resolution

- [x] 3.1 Add `projectName` and `environmentName` fields to the audit list response DTO in `backend/src/audit/*`.
- [x] 3.2 Resolve these names via join/lookup at query time in the audit list query, returning `null` when the referenced project/environment no longer exists.
- [x] 3.3 Add/update backend tests covering: name resolves for an existing project/environment; name is `null` for a deleted one; id is still present either way.

## 4. Backend: OpenAPI/Swagger

- [x] 4.1 Add `@nestjs/swagger` dependency and wire up `SwaggerModule` in `backend/src/main.ts`, serving the UI at `/api/docs`.
- [x] 4.2 Configure an HTTP bearer `securityScheme` matching the actual `JwtAuthGuard` access-token authentication (the access token from `/auth/login`/`/auth/register`, not the httpOnly refresh cookie).
- [x] 4.2b Enable the `@nestjs/swagger` CLI plugin in `backend/nest-cli.json` so request DTO classes get schemas generated from their real TypeScript types (verified: response DTOs are plain interfaces and cannot be schema'd this way — see design.md correction; they remain documented by status + description only).
- [x] 4.3 Annotate the auth controller with `@ApiTags`/`@ApiOperation`/`@ApiResponse`/`@ApiBearerAuth` (DTO schemas come from the plugin).
- [x] 4.4 Annotate the organizations controller and its DTOs.
- [x] 4.5 Annotate the projects and environments controllers and their DTOs.
- [x] 4.6 Annotate the feature-flags controller (including environment config endpoints) and its DTOs.
- [x] 4.7 Annotate the targeting-rules controller and its DTOs.
- [x] 4.8 Annotate the segments controller and its DTOs.
- [x] 4.9 Annotate the sdk-keys controller and its DTOs.
- [x] 4.10 Annotate the audit controller and its DTOs (including the new `projectName`/`environmentName` fields from section 3).
- [x] 4.11 Annotate the realtime and analytics controllers and their DTOs.
- [x] 4.12 Annotate the evaluations controller and its DTOs.
- [x] 4.13 Mark every protected route with the security requirement so `/api/docs` shows which routes require authentication.
- [x] 4.14 Manually verify `/api/docs` renders all 12 controller groups with no missing/broken schema references (verified via `/api/docs-json` against the running server: 30 routes, 13 tags including all 12 controllers, `access-token` bearer scheme applied to protected routes, `x-flagforge-key` header documented on evaluations, zero untagged operations).

## 5. Frontend: Remove Health-Check UI

- [x] 5.1 Delete `frontend/src/infrastructure/hooks/App/useHealth.ts` and the `getHealth` call/types in `frontend/src/infrastructure/api/App/*`.
- [x] 5.2 Remove health wiring from `frontend/src/infrastructure/useCases/App/useAppUseCase.ts` (delete the hook entirely if nothing else remains in it) and `frontend/src/core/types/App/*`.
- [x] 5.3 Remove `apiStatus`/`isCheckingApi` (and the already-dead `isApiAvailable`/`apiServiceName`) from the 9 feature hooks that currently spread `...app` (Home, Flags, FeatureFlagDetail, Projects, ProjectAnalytics, ProjectDetail, Audit, ProjectFlags, Segments).
- [x] 5.4 Remove `apiStatus`/`isCheckingApi` props and the `StatusBadge` rendering from `frontend/src/presentation/components/AppShell/index.tsx`; update its `Props` interface.
- [x] 5.5 Remove `apiStatus`/`isCheckingApi` props from the 12 containers passing them into `AppShell`, and remove the `Badge` showing `apiStatus` in `Home/index.tsx`.
- [x] 5.6 Delete the now-orphaned `StatusBadge` component (`frontend/src/presentation/components/Common/StatusBadge`).
- [x] 5.7 Grep the full frontend for any remaining reference to `apiStatus`, `isCheckingApi`, `isApiAvailable`, `apiServiceName`, `useHealth`, or `StatusBadge` and confirm zero hits.

## 6. Frontend: Fix Real UI Bugs

- [x] 6.1 Add a `confirmingLabel` prop to `frontend/src/presentation/components/Common/ConfirmDialog/index.tsx` (defaulting to `"Deleting"`), and use it instead of the hardcoded string.
- [x] 6.2 Pass `confirmingLabel="Revoking"` from `frontend/src/presentation/components/SdkKeys/SdkKeyPanel/index.tsx` for the revoke-key confirmation.
- [x] 6.3 Audit other `ConfirmDialog` call sites for similarly mismatched labels and pass explicit `confirmingLabel` where the action isn't a delete.
- [x] 6.4 Fix the broken pluralization in `frontend/src/presentation/components/Segments/ProjectSegmentList/index.tsx:150` — use `"segment"`/`"segments"` matching the pattern used elsewhere, not `"visible"` in both branches.
- [x] 6.5 Fix the audit pagination label in `frontend/src/presentation/components/Audit/index.tsx` to stop presenting the fixed page-size limit as a total (drop the "of N" suffix; show only the real known count).
- [x] 6.6 Update the audit UI to render the new `projectName`/`environmentName` fields (from section 3) instead of raw `Project {id}` / `Environment {id}` badges, falling back to the id only when the resolved name is `null`.

## 7. Frontend: Remove Decorative/Misrepresentative Elements

- [x] 7.1 Remove the fake fixed-width progress bars from the Home dashboard cards (`frontend/src/presentation/containers/Home/index.tsx:57-66`).
- [x] 7.2 Remove the hardcoded "highlighted" auth-screen list bar (`frontend/src/presentation/components/Auth/index.tsx:54-64`, `consts.ts`) or make its highlighted state meaningful; if no meaningful state exists, remove the bar entirely.
- [x] 7.3 Remove the per-flag "type" badge rendering `{flag.type.toLowerCase()}` from the three locations that show it (`FeatureFlagDetail` container, `FeatureFlags/FeatureFlagDetail`, `FeatureFlags/ProjectFlagList`).

## 8. Frontend: Terminology and Action-State Copy

- [x] 8.1 Replace "Workspace" (`AppShell/index.tsx:101`) and "Local workspace" (`Auth/index.tsx:82`) with "Organization"/"Local organization" (or remove the badge if redundant with the org name already shown).
- [x] 8.2 Fix the Register field label/error mismatch (`containers/Register/index.tsx:28` label vs `hooks/Register/data.ts:6` error) so both say "Organization name".
- [x] 8.3 Align the "Delete flag" / "this feature flag" / "Delete feature flag" mix in `FeatureFlags/ProjectFlagList/index.tsx:172-178` to one consistent term.
- [x] 8.4 Change the Auth forms' "Please wait" submit-button copy (`Auth/index.tsx:114`) to match the `-ing`-verb pattern used elsewhere (e.g. "Signing in"/"Registering").
- [x] 8.5 Fix the lowercase `"deleting"` badge in `Segments/SegmentDetail/index.tsx:287` to match the capitalized convention used by sibling status badges.

## 9. Frontend: Demo Credentials Gating

- [x] 9.1 Add a `VITE_SHOW_DEMO_CREDENTIALS` variable to `frontend/.env.example` and `.env.docker.example` (both `true` for local/demo use).
- [x] 9.2 Gate the demo-credentials alert in `frontend/src/presentation/components/Auth/index.tsx` behind `import.meta.env.VITE_SHOW_DEMO_CREDENTIALS`.

## 10. Frontend: Nav Item and Code Consolidation

- [x] 10.1 Remove the disabled top-level "Environments" nav item from `AppShell/index.tsx` (environments remain reachable via project detail).
- [x] 10.2 Extract the duplicated operator lists, label maps, `formatComparisonValue`/`parsePrimitiveValue`/`parseComparisonValue`, and list-reorder helper shared between `presentation/hooks/TargetingRules/{data,fns}.ts` and `presentation/hooks/Segments/{data,fns}.ts` into a shared module, and update both call sites to use it.
- [x] 10.3 Align `frontend/src/infrastructure/api/SdkKey/types.ts` with the `extends CoreType {}` pattern used by sibling API types files (Environment, Project).

## 11. Documentation

- [x] 11.1 Identify the boundary between README's accurate operational section and the aspirational planning section.
- [x] 11.2 Delete the aspirational section (confirmed RBAC is not actually a usable feature — only Owner accounts can be created today and only one permission check exists — so it was deliberately left out of the Features summary rather than folded forward, to avoid repeating the aspirational doc's overselling problem).
- [x] 11.3 Add a concise "Features" summary near the top of README covering segments, targeting rules, analytics, realtime SSE updates, and audit logs.
- [x] 11.4 Add a note in README's setup steps about `VITE_SHOW_DEMO_CREDENTIALS` and document the new `/api/docs` endpoint.
- [x] 11.5 Re-verify every command, path, port, and endpoint claim in the resulting README against the actual repo state (repeat the checks from the earlier verification pass).

## 12. Verification

- [x] 12.1 Run `corepack pnpm build`. (The pnpm wrapper's engine gate hard-fails in this sandbox — Node 24.4.0 vs the repo's pinned `>=26.7.0` — for `-r build` on *any* workspace package, including untouched ones, so this is a pre-existing local-environment limitation, not something introduced here. Verified equivalently via direct compiler invocation: `nest build` for backend, `tsc -b && vite build` for frontend, and the `js-sdk` build script — all clean.)
- [x] 12.2 Run `corepack pnpm test`. (Same pnpm-wrapper limitation as 12.1; ran the underlying test runners directly instead — backend Jest: 25 suites / 89 tests passed; `js-sdk` Jest: 1 suite / 8 tests passed; frontend's own "test" script is a `tsc` type-check, covered by 12.3.)
- [x] 12.3 Run `corepack pnpm lint`. (Ran `tsc --noEmit`/`tsc -b` directly for backend, frontend, and js-sdk — all clean, no ESLint config exists in this repo.)
- [x] 12.4 Run `openspec validate polish-production-readiness --strict`. (Valid.)
- [x] 12.5 Manually verify the fixes against a running backend with real seeded data (no browser automation available in this environment, so this covers backend-observable behavior, not literal UI clicks): booted `dist/main.js` on a scratch port against the existing Postgres/Redis containers, logged in as the seeded demo user, and confirmed `GET /audit` returns entries with resolved `projectName`/`environmentName` (e.g. "Checkout Platform" / "Staging") instead of raw UUIDs, including with an `environmentId` filter applied. This caught and fixed a real bug: the original `leftJoin` + `getRawAndEntities` implementation threw a 500 (`Cannot read properties of undefined (reading 'databaseName')`) — TypeORM can't combine a raw-table `leftJoin`/`addSelect` with cursor `orderBy` in `getRawAndEntities` mode. Rewrote `AuditService.findAll` to page audit logs first, then resolve project/environment names via a separate batched `IN` lookup — confirmed working against real data, and updated `audit.service.spec.ts` to mock the two additional repositories instead of the removed query-builder methods. Frontend UI behavior (no health badge, "Revoking" label, etc.) was verified via code review + type-check + successful `vite build`, not a live click-through.
- [x] 12.6 Manually verify `/api/docs` loads and reflects real routes. (Hit `/api/docs-json` on the same running instance: 30 routes, 13 operation tags — one per controller plus `Health` — zero untagged operations, `access-token` bearer scheme applied to protected routes like `GET /projects`, no security requirement on public auth routes, and the `x-flagforge-key` header documented on the SDK evaluation routes instead.)
