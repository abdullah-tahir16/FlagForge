## Why

FlagForge can now create and configure boolean feature flags, but applications cannot safely consume those flags. Adding environment-scoped SDK keys and evaluation endpoints turns the management dashboard into a usable feature flag service.

## What Changes

- Add environment-scoped SDK key management for authenticated organization users.
- Store only hashed SDK keys, expose a short prefix for identification, and show full key material only once at creation.
- Add public SDK authentication using an SDK key header instead of user JWTs.
- Add single-flag evaluation for boolean flags by key.
- Add all-flags evaluation for an environment.
- Define deterministic boolean evaluation behavior for enabled/disabled/missing flags.
- Seed the local demo with at least one usable SDK key or provide a repeatable local key creation path.
- Add a small dashboard surface for environment SDK key creation, one-time key display, and revocation.
- Keep JavaScript SDK package, Redis caching, realtime updates, targeting rules, percentage rollouts, analytics, and audit persistence out of scope for this change.

## Capabilities

### New Capabilities

- `sdk-key-management`: Environment-scoped SDK keys, key hashing, one-time secret display, revocation, and management API/dashboard behavior.
- `flag-evaluation-api`: Public SDK-key authenticated endpoints for evaluating one boolean flag or all boolean flags in an environment.

### Modified Capabilities

- `environment-management`: Environments become the ownership boundary for SDK keys and public evaluation context.
- `dashboard-ui-foundation`: Dashboard screens expose SDK key management using shared primitives, theme tokens, and responsive layouts.

## Impact

- Backend: `backend/src/sdk-keys`, `backend/src/evaluations`, TypeORM entities, migration, DTOs, controllers, services, module wiring, and Jest tests.
- Frontend: SDK key domain types, API calls, TanStack Query hooks, use-case orchestration, presentation hooks, dashboard components, and project/environment integration.
- Data: PostgreSQL table for SDK keys with hashed key material, prefix metadata, timestamps, and revocation state.
- Docs: README local workflow, endpoint list, demo evaluation examples, and roadmap status updates.
