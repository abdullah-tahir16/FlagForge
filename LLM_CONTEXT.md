# FlagForge LLM Context

Use this file as durable project guidance before planning or applying changes.

## Project Shape

- Keep the repo as a pnpm workspace with two app folders: `frontend/` and `backend/`.
- Use the current/latest pinned project tooling from repo config. The project expects Node `>=26.7.0` and pnpm `11.21.0`.
- Backend stack: NestJS, `@nestjs/cqrs`, PostgreSQL, TypeORM, Jest.
- Frontend stack: Vite, React, React Router, TanStack Query, Tailwind CSS, React Final Form, Zod.
- Use PostgreSQL when persistence is required. Do not introduce a different database without an OpenSpec change.
- Keep local demo data seedable through `pnpm seed`. The local demo owner credential is `user@example.com` / `password123`, with a demo project and default environments.

## Frontend Architecture

Keep all frontend source code under `frontend/src/` split into:

- `core/` for stable domain types and domain-only definitions.
- `infrastructure/` for API calls, TanStack Query hooks, and use-case orchestration.
- `presentation/` for route containers, screen hooks, and UI components.

Use this structure for frontend domains:

- Stable domain definitions go in `core/types/<DomainName>/types.ts`.
- Re-export domain types from `core/types/<DomainName>/index.ts`.
- Pure backend/API integration goes in `infrastructure/api/<DomainName>/index.ts`.
- Transport request/response types go in `infrastructure/api/<DomainName>/types.ts`.
- Add one TanStack Query hook or mutation per file in `infrastructure/hooks/<DomainName>/use<Operation>.ts`.
- Put orchestration logic in `infrastructure/useCases/<DomainName>/use<DomainName>UseCase.ts`.
- Put thin route wrappers in `presentation/containers/<DomainName>/index.tsx`.
- Put screen-level UI behavior in `presentation/hooks/<DomainName>/use<DomainName>Feature.ts`.
- Put feature UI in `presentation/components/<DomainName>/index.tsx`.
- Split child components into folders such as `Header/index.tsx`, `Actions/index.tsx`, `Form/index.tsx`, `List/index.tsx`, `Card/index.tsx`, `Table/index.tsx`, and `Modal/index.tsx`.

## Frontend File Rules

- Keep React component files to one default-exported arrow component with a `Props` interface.
- Keep constants in `consts.ts`.
- Keep pure helper functions in `fns.ts`.
- Keep schemas and static lookup data in `data.ts`.
- Keep API files as pure HTTP calls only.
- Keep hooks as query/mutation wrappers only.
- Keep use-cases as business orchestration only.
- Keep containers as render-only wrappers.
- Keep presentation hooks as the place for transient UI state, handlers, and derived view data.

## Forms and Validation

- Use `react-final-form` for form state and submit lifecycle.
- Use Zod for validation schemas.
- Put reusable form wrappers and controls under `frontend/src/presentation/components/Common`.
- Keep common controls small and composable.
- Put screen-specific validation schemas in the relevant presentation hook folder `data.ts`.
- Do not store refresh tokens in frontend JavaScript. Auth refresh tokens use httpOnly cookies.

## Theme and UI

- Theme values are controlled from `frontend/src/styles.css` CSS variables under `:root`.
- Tailwind semantic tokens are mapped in `frontend/tailwind.config.ts`.
- Use semantic tokens such as `app-primary`, `app-accent`, `app-surface`, `app-background`, `app-border`, `app-text`, `app-text-muted`, `app-success`, `app-warning`, and `app-danger`.
- Do not hardcode Tailwind palette colors such as `slate-*`, `blue-*`, `red-*`, or `emerald-*` inside app UI unless a change explicitly calls for a temporary exception.
- The default FlagForge palette is forge teal for primary actions, signal amber for secondary emphasis, graphite neutrals for work surfaces, and clear success/warning/danger states.
- If the user asks to change the theme, update CSS variables first so the whole project changes from one setting layer.
- Common UI components must consume theme tokens instead of per-screen colors.
- Keep SaaS/dashboard UI quiet, utilitarian, and work-focused: dense but organized information, restrained visual styling, predictable navigation, and scan-friendly surfaces.
- Cards should use `rounded-app` or smaller. Do not nest cards inside cards.
- Ensure text fits within buttons, inputs, panels, and responsive layouts.

## Dashboard UI/UX Rules

- Authenticated routes must render inside the shared dashboard shell. Do not add page-local top navigation when the shell can own workspace, navigation, API status, user context, and logout.
- Desktop dashboard layout uses a persistent sidebar plus top bar. Mobile layout must keep primary navigation reachable at 375px without horizontal scrolling.
- Navigation must include icon and label for Overview, Projects, Flags, Environments, and Audit. Disabled navigation states must be visually clear and use `aria-disabled` when a route is unavailable.
- Segment management routes must render under the shared dashboard shell and use the Segments nav item. Project-scoped segment routes live under `/projects/:projectId/segments`.
- Active route state cannot rely on color alone. Include a persistent indicator such as a border, rail, background, or font-weight shift.
- Use `lucide-react` icons for structural actions and navigation. Do not use emoji, decorative ad hoc SVG, or text-only icon stand-ins for common actions. Icon-only buttons need `aria-label` and `title`.
- Use shared primitives from `frontend/src/presentation/components/Common` for dashboard screens: `PageHeader`, `Toolbar`, `Badge`, `Alert`, `EmptyState`, `Skeleton`, `ConfirmDialog`, and dense row/list primitives.
- Do not use browser `alert`, `confirm`, or `prompt` for product workflows. Use themed feedback and confirmation components.
- Loading states should use skeletons where layout size is predictable. Empty states should make the next action visible. Error states should use `Alert`.
- Destructive actions must use destructive theme tokens and a confirmation dialog with cancel and confirm actions.
- Keep dashboard surfaces compact. Prefer dense rows, tables, toolbars, and structured panels over marketing sections or oversized cards.
- Use stable widths, min heights, and grid tracks for rows, buttons, toolbars, badges, dialogs, and forms so loading/error text does not shift layout unexpectedly.
- Respect reduced motion through shared motion tokens and `prefers-reduced-motion`.
- Verify app UI at 375px mobile, 1024px desktop, and 1440px desktop when changing shell, auth, project, or environment screens.

## Pagination

- Prefer cursor pagination for list APIs that can grow over time, especially audit logs, events, activity feeds, SDK key lists, and future flag/segment history screens.
- Backend cursor-paginated endpoints should use the shared helpers under `backend/src/common/pagination/`.
- Backend list responses should return a stable envelope:
  - `entries`: the current page items.
  - `pagination.hasNextPage`: whether a next page exists.
  - `pagination.limit`: the bounded page size actually used by the backend.
  - `pagination.nextCursor`: an opaque cursor string or `null`.
- Do not expose cursor internals to the frontend. Treat cursors as opaque values.
- Backend DTOs should bound `limit`, accept optional `cursor`, and keep filtering fields separate from pagination fields.
- Frontend domain types should reuse `CursorPaginationParams` and `CursorPaginatedList` from `frontend/src/core/types/Pagination`.
- Frontend screens should use `useCursorPagination` from `frontend/src/presentation/hooks/Common` for cursor stack state instead of hand-rolling previous/next behavior.
- Frontend screens should render pagination through `PaginationControls` from `frontend/src/presentation/components/Common/PaginationControls` when the standard previous/next UX is sufficient.
- Applying or clearing filters must reset pagination to the first page.
- Changing page must preserve the active filters and only change the cursor.

## Targeting Rules

- Targeting rules are scoped to `EnvironmentFlagConfig`, not only to `FeatureFlag`, so each environment can have different rules.
- Rule management endpoints live under `projects/:projectId/flags/:flagId/environments/:environmentId/rules`.
- Targeting rule lists are intentionally unpaginated because evaluation order requires the full rule stack.
- A targeting rule has one source-specific condition for the current MVP. `ATTRIBUTE` rules use `attribute`, `operator`, `comparisonValue`, `resultValue`, and `sortOrder`. `SEGMENT` rules use `segmentId`, `resultValue`, and `sortOrder`.
- Supported MVP operators are `EQUALS`, `NOT_EQUALS`, `CONTAINS`, `NOT_CONTAINS`, `STARTS_WITH`, `ENDS_WITH`, `IN`, `NOT_IN`, `GREATER_THAN`, `GREATER_THAN_OR_EQUAL`, `LESS_THAN`, and `LESS_THAN_OR_EQUAL`.
- SDK evaluation order is disabled check, ordered segment-source rules first-match-wins, ordered attribute-source rules first-match-wins, percentage rollout fallback, then static configured value behavior.
- Disabled flag configs must return false before targeting or rollout logic.
- Rule mutations must emit audit events using targeting rule action/resource metadata.
- Frontend targeting forms must use React Final Form and Zod, shared Common controls, semantic app theme tokens, lucide icons, and compact dashboard rows.

## Segments

- Segments are project-scoped reusable cohorts and must not be shared across projects or organizations.
- Segment list APIs use cursor pagination with the shared backend pagination helpers and frontend `useCursorPagination`/`PaginationControls`.
- Segment condition lists are unpaginated, ordered, and edited as a complete stack.
- Segment match modes are `MATCH_ALL` and `MATCH_ANY`. Empty segments do not match.
- Segment conditions reuse targeting rule operators and comparison-value validation.
- Referenced segments cannot be deleted while targeting rules point at them.
- Segment mutations must emit audit events using `SEGMENT` and `SEGMENT_CONDITION` resource metadata.
- Demo seed data should keep representative segments and segment-source targeting rules idempotent.

## Redis Evaluation Cache

- Redis is optional performance infrastructure, not correctness infrastructure. SDK evaluation must fall back to PostgreSQL when Redis is disabled, unavailable, returns an operation error, contains invalid JSON, or contains an unsupported cache schema version.
- The backend caches complete environment evaluation snapshots, not per-flag records. Cache keys use `flagforge:evaluation:v1:environment:<environmentId>`.
- Cached snapshots must include schema version, project id, environment metadata, boolean flag metadata, environment config values, rollout percentage, ordered targeting rules, referenced segment metadata, and ordered segment conditions.
- Cache writes must use `EVALUATION_CACHE_TTL_SECONDS` as a bounded lifetime. TTL is a backstop; service-level invalidation is the primary freshness mechanism.
- Feature flag create/update/delete and environment flag config updates must invalidate affected environment snapshot keys after successful writes.
- Targeting rule create/update/delete/reorder must invalidate the one affected environment snapshot.
- Segment metadata, match mode, and condition mutations must invalidate only environments whose targeting rules reference the segment. Unreferenced segment mutations should not delete cache entries.
- Cache invalidation failures must not fail successful management mutations or expose raw Redis details to API clients.

## Backend Guidance

- Use NestJS modules by domain.
- Use CQRS patterns for business actions and queries when a feature has meaningful behavior.
- Use TypeORM entities and migrations for persisted schema changes.
- Keep production schema changes migration-based; do not rely on production synchronization.
- Keep seed scripts idempotent so rerunning them repairs local demo credentials instead of creating duplicates.
- Add Jest tests for backend behavior introduced by a change.

## Verification

- For code changes, run the relevant checks before finishing.
- Prefer root checks when the change crosses frontend/backend boundaries:
  - `corepack pnpm build`
  - `corepack pnpm test`
  - `corepack pnpm lint`
- If checks cannot run, state exactly why.
