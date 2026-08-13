## Context

FlagForge currently supports authenticated users, organizations, projects, environments, boolean feature flags, and per-environment boolean flag configuration. The repo already contains empty `SdkKeysModule` and `EvaluationsModule` placeholders. The next product gap is that external applications cannot authenticate as an environment and cannot evaluate configured flags.

This change must follow the existing pnpm workspace, NestJS/TypeORM/Postgres backend, React Router/TanStack Query frontend, React Final Form/Zod forms, and dashboard UI rules in `LLM_CONTEXT.md`.

## Goals / Non-Goals

**Goals:**

- Persist environment-scoped SDK keys without storing raw key material.
- Allow authenticated users to list, create, and revoke SDK keys for environments in their organization.
- Show the full SDK key only once after creation.
- Authenticate public SDK evaluation requests with an SDK key header.
- Evaluate one boolean flag by key for the SDK key's environment.
- Evaluate all boolean flags for the SDK key's environment.
- Return safe boolean defaults for disabled or missing flags.
- Provide a compact dashboard surface for key creation, one-time display, and revocation.
- Add seed/docs/tests so the local demo can call the evaluation API.

**Non-Goals:**

- JavaScript SDK package.
- Redis caching, realtime updates, analytics, or audit persistence.
- Percentage rollouts, targeting rules, segments, prerequisites, or multi-variant values.
- Editable SDK key secrets after creation.
- Rate limiting beyond leaving route boundaries ready for a later change.

## Decisions

### Scope SDK keys to environments

An SDK key identifies one environment and reaches the organization/project through the existing environment/project relationship.

Data model:

- `sdk_keys`: `id`, `environment_id`, `name`, `key_hash`, `key_prefix`, `last_used_at`, `revoked_at`, timestamps.

Alternative considered: scope SDK keys to projects and pass an environment key during evaluation. Environment-scoped keys are safer for client applications because a leaked Development key cannot query Production flags.

### Store only a hash of the SDK key

Generate a random secret such as `ff_<environmentKey>_sk_<random>` and store only a SHA-256 hash plus a short prefix. The full key is returned only from the create endpoint and never returned from list/detail endpoints.

Alternative considered: encrypt and store the raw key. That would support re-display, but it increases blast radius and is unnecessary because SDK keys can be recreated.

### Use dedicated SDK authentication instead of JWT guards

Management routes stay behind the existing JWT auth guard. SDK evaluation routes use an SDK key header:

- `X-FlagForge-Key: <sdk key>`

The evaluation service hashes the provided key, finds a non-revoked matching key, loads its environment/project context, and updates `lastUsedAt`.

Alternative considered: `Authorization: Bearer <sdk key>`. A dedicated header avoids confusion with user JWTs and makes frontend/backend tests explicit.

### Keep evaluation deterministic and boolean-only

Evaluation uses the existing persisted boolean config:

```text
if key is invalid           -> 401
if flag is missing          -> false, reason FLAG_NOT_FOUND
if config is missing        -> false, reason CONFIG_NOT_FOUND
if config.enabled is false  -> false, reason DISABLED
else                        -> config.value, reason STATIC
```

The all-flags endpoint returns every boolean flag in the environment with the same disabled semantics.

Alternative considered: return 404 for missing flags. SDK calls should fail safely and predictably, so missing flags return `false` with a reason while invalid SDK keys remain an authentication failure.

### Keep public API separate from management API

Management endpoints stay under project/environment hierarchy:

- `GET /api/v1/projects/:projectId/environments/:environmentId/sdk-keys`
- `POST /api/v1/projects/:projectId/environments/:environmentId/sdk-keys`
- `DELETE /api/v1/projects/:projectId/environments/:environmentId/sdk-keys/:sdkKeyId`

SDK endpoints live under:

- `POST /api/v1/sdk/evaluate/:flagKey`
- `POST /api/v1/sdk/evaluate`

Alternative considered: reuse management flag endpoints for evaluation. Keeping SDK routes separate makes auth, response contracts, and later rate limiting cleaner.

### Add key management where environments are already visible

The first dashboard surface should attach SDK key management to the project detail environment area. This avoids inventing a separate Environments route before it has enough workflow weight.

Alternative considered: create a full `/sdk-keys` route. That is useful later for cross-project key inventory, but the first workflow is environment-specific.

## Risks / Trade-offs

- SDK key leakage in logs or UI -> Never persist raw keys, display full key only once, and avoid logging request headers.
- Key prefix collision -> Store full hash for authentication and use prefix only for identification; prefix collisions are cosmetic.
- Cross-organization key management bugs -> Verify project ownership first, then environment ownership, before listing/creating/revoking keys.
- Evaluation accidentally exposes management-only data -> SDK responses include only evaluation values, reasons, flag keys, and timestamps/version metadata needed by clients.
- `lastUsedAt` write on every evaluation can become hot later -> Accept for local MVP; Redis/analytics/rate-limiting can move this off the request path in later changes.
- Dashboard one-time key display is easy to lose on navigation -> Keep copy action visible immediately after create and explain that it cannot be shown again.

## Migration Plan

1. Add the `sdk_keys` table with foreign key to `environments`.
2. Register the SDK key entity in TypeORM and seed/update demo keys idempotently where possible.
3. Add backend management routes and tests.
4. Add backend evaluation routes and tests.
5. Add frontend key management surface and responsive verification.
6. Update README endpoints and local curl example.

Rollback removes the SDK key table and routes. Existing feature flag, project, environment, and auth tables are unchanged.

## Open Questions

- Should the seed print a deterministic demo SDK key to the console each run, or should local users create a fresh key from the dashboard?
- Should the all-flags response include disabled flags with `false`, or only enabled flags? This design chooses all configured boolean flags with safe false values for disabled flags.
