## Context

This change bundles a set of production-readiness fixes surfaced during a manual review: a health-check UI that leaks internal status as user-facing copy, dead backend code, a handful of concrete UI bugs (mislabeled confirm dialog, broken pluralization, misleading pagination summary, raw UUIDs shown to users), decorative UI elements with no real data behind them, inconsistent terminology, a missing OpenAPI reference, and a README that is mostly a stale aspirational planning document rather than accurate operational docs.

These items were deliberately combined into one change (the user's choice, overriding the smaller-slice split proposed during exploration) because none of them require deep sequencing against each other and all serve the same "make the product match its own claims" goal.

## Goals / Non-Goals

**Goals:**
- Remove the frontend health-check polling/UI without touching the backend `/health` endpoint (Docker healthchecks and `scripts/smoke-local.mjs` depend on it).
- Fix the concrete UI bugs found (mislabeled confirm dialog, broken pluralization, misleading audit pagination copy, raw UUIDs in audit badges) as real defects, not cosmetic polish.
- Remove decorative UI elements that visually imply data/metrics but are structurally incapable of varying (fixed-position progress bars, a single-value "type" badge).
- Standardize terminology ("Organization" over "Workspace"/"Local workspace"; consistent flag terminology within a flow; consistent in-progress button copy).
- Add real OpenAPI/Swagger documentation covering all controllers, including how protected routes are documented.
- Restructure `README.md` so it stops asserting capabilities and architecture that don't exist.
- Close the OpenSpec bookkeeping gap: archive the completed `add-ci-and-docker-polish` change and correct the two stale `docs/ROADMAP.md` rows.

**Non-Goals:**
- Not building any new product feature (multi-type flags, RBAC UI, rate limiting) — `FeatureFlagType` stays a single-value enum; this change only stops the UI from presenting it as meaningful per-flag metadata.
- Not adding OpenAPI-driven client generation or contract testing — scope is documentation coverage at `/api/docs`, not tooling built on top of it.
- Not redesigning visual style, theming, or layout — copy/label/behavior fixes only, using existing shared components and tokens.
- Not changing audit log pagination to offer real total counts (cursor pagination doesn't cheaply support that) — the fix is to stop the frontend from fabricating a false total, not to add a count query.

## Decisions

**Health-check removal is a full deletion, not a feature flag.** The `apiStatus`/`isCheckingApi`/`isApiAvailable`/`apiServiceName` fields, `useHealth`, `useAppUseCase`'s health wiring, and `StatusBadge` are deleted outright along with every prop/spread that threads them through 9 feature hooks and 12 containers. Alternative considered: keep the API call but hide the badge — rejected, since `isApiAvailable`/`apiServiceName` are already dead code today and the polling itself serves no purpose once the badge is gone.

**`FeatureFlagType` stays as-is; only its UI presentation changes.** Rather than removing the enum (a backend/data-model change with no current product need) or building out multi-type support (out of scope), the fix is UI-only: stop rendering `{flag.type.toLowerCase()}` as a distinguishing badge when it can only ever say "boolean." Alternative considered: delete the field entirely — rejected because it's reasonable future-proofing and removing it would be a gratuitous backend change unrelated to the actual bug (a meaningless badge).

**`ConfirmDialog` takes an explicit in-progress label instead of hardcoding "Deleting."** The component gains a `confirmingLabel` prop (defaulting to `"Deleting"` for the majority delete case, so existing delete call sites don't need changes) that callers doing a different destructive action (e.g. revoke) pass explicitly. Alternative considered: derive the label by string-transforming `confirmLabel` (e.g. "Revoke key" → "Revoking key") — rejected as fragile string manipulation; an explicit prop is simpler and matches how the rest of the app already threads specific verbs per mutation (`isRevoking`, `isDeleting`, etc.).

**Audit pagination copy stops claiming a total it doesn't have.** Cursor-based pagination has no cheap total count. Instead of adding a count query (backend change, extra load), the fix is presentational: the audit page label shows what's actually known (e.g. "Page 2 · 25 shown") and drops the "of N" suffix that currently fabricates the page-size limit as a total.

**Raw UUID audit badges are fixed by resolving names server-side, not client-side.** The audit list response gains `projectName` and `environmentName` alongside the existing `projectId`/`environmentId`, resolved via join at query time (not stored redundantly, so renamed projects/environments always show current names). Alternative considered: resolve names client-side by cross-referencing already-fetched project/environment lists — rejected because the audit screen isn't guaranteed to have those lists loaded (e.g. deep-linking directly to `/audit`), and a deleted project/environment would have no client-side name to fall back to; the backend can still return `null` for a deleted resource, same as it already does for other deleted-resource cases (per the existing "Deleted resource remains readable" requirement).

**"Organization" is the canonical term; "Workspace" and "Local workspace" are removed from UI copy.** This matches the backend domain model (an `Organization` entity, not a `Workspace` entity) and the existing majority usage. For flag terminology, "feature flag" is used in descriptive sentences and dialog bodies; short labels (nav items, inline badges) may still say "flag" — the fix is to stop mixing both forms within the same dialog or flow (e.g. a single delete-confirmation dialog must not say "flag" in one line and "feature flag" in the next).

**Demo credentials are gated behind an explicit build-time flag, not always rendered.** The Login/Register demo-credentials alert becomes conditional on `import.meta.env.VITE_SHOW_DEMO_CREDENTIALS` (set in `.env.example`/`.env.docker.example` for local/demo use, unset in a real deployment). Alternative considered: remove the alert entirely — rejected because it's genuinely useful for the documented local/Docker demo workflow; the fix is to stop it from being unconditional, not to delete it.

**Swagger auth documentation uses a bearer-token scheme, matching the real `JwtAuthGuard`.** Corrected during implementation after reading `jwt.strategy.ts`: the guard extracts the access token via `ExtractJwt.fromAuthHeaderAsBearerToken()` — a bearer token in the `Authorization` header — not a cookie. Only the separate *refresh* token lives in an httpOnly cookie (`auth-cookie.service.ts`), used solely by `/auth/refresh` and `/auth/logout`, and is not the credential protected routes check. `/api/docs` therefore documents an HTTP bearer `securityScheme` for the access token returned by `/auth/login`/`/auth/register`, which a developer can paste into Swagger UI's "Authorize" dialog to exercise protected routes directly — more useful for a developer-facing reference than the cookie-based approach originally assumed here.

**DTO schemas are generated via the `@nestjs/swagger` CLI plugin, not hand-written `@ApiProperty` decorators — but this only reaches request bodies, not response bodies.** Discovered during implementation: most response DTOs in this codebase (`*-response.dto.ts`) are plain TypeScript `interface`s, not classes. The `@nestjs/swagger` CLI plugin (`nest-cli.json` → `compilerOptions.plugins: ["@nestjs/swagger"]`) does statically introspect `*.dto.ts` files and successfully injects schema metadata for request DTO *classes* (verified: `CreateProjectDto` and its siblings render full property schemas in the generated document) — that part works exactly as intended, with zero manual annotation and zero drift risk versus the real `class-validator`-decorated shape.

Response bodies are a different story, verified empirically against the running server's `/api/docs-json`: `@ApiResponse({ status, description })` was added by hand on every route (no `type` field, since `type` must be a runtime value and TypeScript interfaces don't exist at runtime — `type: () => FeatureFlagResponse` is not valid TypeScript). The plugin's own response-schema auto-injection only fires when *no* `@ApiResponse` decorator already exists for that status code, so the hand-written description-only decorators suppressed it. Net effect: every response body in `/api/docs` is documented today by status code and a human-written description, but not by a checkable JSON schema.

Closing that gap fully would mean converting every response DTO (`*-response.dto.ts`) from an `interface` to a `class` across every module (project, environment, feature-flag, targeting-rule, segment, sdk-key, audit, organization, auth, analytics, evaluation) — a much larger, invasive change than "annotate controllers," touching the core data-shape declarations used throughout the backend's service layer, and explicitly out of scope for this change (see Non-Goals). Decision: accept description-only response documentation for this change; a full response-DTO-to-class conversion is a separate, larger follow-up if machine-checked response schemas are wanted later. Controller-level decorators (`@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`) are still added by hand, since those aren't inferable from types regardless.

**README's aspirational section is deleted, not relocated.** The ~3,700-line planning-document section is superseded by the accurate operational section plus a new "Features" summary; moving it to `docs/` as "historical" was considered but rejected because it actively contradicts current behavior (wrong ports, invented endpoints, fake tech stack) and keeping it anywhere invites a future reader to trust it. Anything still useful (e.g. the RBAC role list, if accurate) is folded into the accurate section instead of preserved as-is.

## Risks / Trade-offs

- [Removing `apiStatus` threading touches 9 feature hooks and 12 containers] → mitigated by doing it as a single mechanical pass with a full-app grep-verification step (confirm zero remaining references to `apiStatus`/`isCheckingApi`/`isApiAvailable`/`apiServiceName`/`StatusBadge`/`useHealth`/`useAppUseCase`'s health fields) before moving on.
- [Backend audit list gains `projectName`/`environmentName` fields — a response shape change] → additive fields only, existing consumers (SDK, any external API users) are unaffected; frontend is the only consumer today per the codebase.
- [Swagger annotation pass across ~12 controllers is the largest single piece of work and easy to under-scope] → tasks.md should treat "one controller fully annotated and verified in `/api/docs`" as the unit of work, not "add Swagger" as one task.
- [Deleting demo credentials from unconditional render could break the documented README demo flow if the new env var isn't set in `.env.docker.example`] → mitigate by setting `VITE_SHOW_DEMO_CREDENTIALS=true` in both `.env.example` and `.env.docker.example` as part of this change, and calling this out explicitly in `README.md`'s updated setup steps.
- [README restructure is a large deletion; if anything in the aspirational section turns out to reflect a real, unimplemented decision someone still intends to build] → mitigated by treating this as an explicit call: OpenSpec (`docs/ROADMAP.md` + archived changes) is the source of truth for planned work, not README prose: nothing is silently lost, it's just no longer duplicated inaccurately in README.

## Migration Plan

No data migration. Sequencing within implementation:
1. Backend: dead-code removal (`AnalyticsService.recordEvaluation`, `cookie` dependency), audit list `projectName`/`environmentName` addition, Swagger wiring — these are independent of the frontend work and can land first so the frontend audit-name fix has a real field to consume.
2. Frontend: health-check removal, `ConfirmDialog` fix, decorative-element removal, terminology pass, demo-credential gating — mechanical, low-risk, verified via `pnpm build`/`pnpm test`/`pnpm lint` plus a manual pass through the dashboard.
3. Docs: README restructure and `docs/ROADMAP.md` correction last, once the actual behavior they describe is final.
4. OpenSpec bookkeeping: archive `add-ci-and-docker-polish` before or after this change (independent of it) — no ordering dependency, but should happen before this change is itself archived so the specs directory reflects both changes cleanly.

Rollback is trivial (revert commits) since nothing here is a one-way data change.

## Open Questions

- Should the Swagger UI be reachable in the production Docker image, or only when a non-production env var is set? (Leaning: reachable, since this is a portfolio/demo project rather than a real multi-tenant SaaS with a reason to hide its API shape — but worth confirming.)
- Is there an existing convention for boolean env flags in this repo (e.g. `VITE_SHOW_DEMO_CREDENTIALS=true`/`false` vs. presence-based) to match for the new demo-credentials flag?
