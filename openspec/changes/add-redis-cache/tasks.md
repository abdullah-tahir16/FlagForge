## 1. Redis Infrastructure

- [x] 1.1 Add Redis service configuration to `docker-compose.yml` with local development defaults.
- [x] 1.2 Add Redis connection and evaluation cache TTL variables to root and backend environment examples.
- [x] 1.3 Add the backend Redis client dependency using the repo's pnpm workspace conventions.
- [x] 1.4 Add backend configuration parsing for Redis URL/host/port and evaluation cache TTL.

## 2. Cache Module And Contracts

- [x] 2.1 Create a backend cache module/service with optional Redis connection lifecycle handling.
- [x] 2.2 Define versioned evaluation cache key helpers for environment snapshot keys.
- [x] 2.3 Define explicit TypeScript DTOs for cached environment snapshots, flags, configs, targeting rules, segments, and segment conditions.
- [x] 2.4 Add cache read/write/delete helpers that handle Redis errors without leaking raw Redis details to API clients.
- [x] 2.5 Add JSON parse and cache schema-version validation for environment snapshot payloads.

## 3. Evaluation Snapshot Loading

- [x] 3.1 Extract PostgreSQL environment snapshot loading from evaluation service into a reusable loader.
- [x] 3.2 Ensure the snapshot loader includes all fields needed for disabled checks, segment targeting, attribute targeting, rollout, static values, and reason metadata.
- [x] 3.3 Add cache miss behavior that loads from PostgreSQL and writes the snapshot to Redis with TTL.
- [x] 3.4 Add cache hit behavior for single-flag evaluation while preserving existing response semantics.
- [x] 3.5 Add cache hit behavior for all-flags evaluation while preserving existing response semantics.
- [x] 3.6 Add Redis outage and invalid-payload fallback paths that evaluate from PostgreSQL.

## 4. Cache Invalidation

- [x] 4.1 Invalidate project environment caches after feature flag creation.
- [x] 4.2 Invalidate affected environment caches after feature flag metadata update and deletion.
- [x] 4.3 Invalidate one environment cache after environment flag config update.
- [x] 4.4 Invalidate one environment cache after targeting rule create, update, delete, and reorder.
- [x] 4.5 Resolve environments referencing a segment and invalidate them after segment metadata or match mode updates.
- [x] 4.6 Resolve environments referencing a segment and invalidate them after segment condition create, update, delete, and reorder.
- [x] 4.7 Keep management mutations successful when Redis invalidation fails, while logging or safely handling the cache failure.

## 5. Tests

- [x] 5.1 Add backend unit tests for cache key generation, TTL handling, schema-version validation, and invalid JSON fallback.
- [x] 5.2 Add backend evaluation tests for cache hit, cache miss with write-through, Redis outage fallback, and invalid payload fallback.
- [x] 5.3 Add backend evaluation tests proving cached single-flag and all-flags decisions match PostgreSQL-backed decisions.
- [x] 5.4 Add backend feature flag service tests for cache invalidation on create, update, config update, and delete.
- [x] 5.5 Add backend targeting rule service tests for cache invalidation on create, update, delete, and reorder.
- [x] 5.6 Add backend segment service tests for referenced-environment invalidation and unreferenced segment no-op behavior.

## 6. Documentation

- [x] 6.1 Update `README.md` with Redis local startup, environment variables, and evaluation cache behavior.
- [x] 6.2 Update `LLM_CONTEXT.md` with durable Redis cache architecture and invalidation guidance.
- [x] 6.3 Update `docs/ROADMAP.md` to reflect Redis cache progress and the next likely realtime step.

## 7. Verification

- [x] 7.1 Run `openspec validate add-redis-cache --strict`.
- [x] 7.2 Run `corepack pnpm build`.
- [x] 7.3 Run `corepack pnpm test`.
- [x] 7.4 Run `corepack pnpm lint`.
- [x] 7.5 Run `corepack pnpm seed` or a local startup smoke check with Redis available when feasible.
