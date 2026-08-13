## Why

Evaluation now loads feature flag configuration, targeting rules, and segment conditions from PostgreSQL on every SDK request. Redis caching is the next performance layer so SDK evaluations can read a prebuilt environment configuration snapshot while management mutations still invalidate stale data predictably.

## What Changes

- Add Redis configuration and a backend cache abstraction for environment flag configuration snapshots.
- Cache the environment's evaluable flag configuration, including flag metadata, environment config values, targeting rules, referenced segment metadata, and segment conditions.
- Update single-flag and all-flags evaluation to prefer cached environment configuration and fall back to PostgreSQL on cache miss or Redis outage.
- Invalidate affected environment caches after flag, environment config, targeting rule, segment, and segment condition mutations.
- Add local Redis service wiring for development and testable cache behavior.
- Document Redis environment variables, local startup, and operational behavior.
- Leave realtime publish/subscribe, SDK-side caching, and analytics event buffering out of scope.

## Capabilities

### New Capabilities

- `redis-cache-management`: Redis-backed backend cache configuration, cache envelope behavior, graceful fallback, and invalidation contract.

### Modified Capabilities

- `flag-evaluation-api`: SDK evaluation reads cached environment flag configuration when available and preserves existing evaluation semantics.
- `feature-flag-management`: feature flag and environment config mutations invalidate relevant evaluation cache entries.
- `targeting-rule-management`: targeting rule mutations invalidate relevant evaluation cache entries.
- `segment-management`: segment and segment condition mutations invalidate relevant evaluation cache entries for environments that reference affected segments.
- `platform-foundation`: local development configuration includes Redis service and documented environment variables.

## Impact

- Backend: Redis client dependency, cache module/service, evaluation data loading, invalidation hooks in feature flag, targeting rule, and segment services, tests for hit/miss/fallback/invalidation.
- Infrastructure: Docker Compose Redis service and `.env.example` / backend env example updates.
- API: SDK evaluation response shapes remain unchanged; behavior must remain equivalent with or without Redis.
- Docs/OpenSpec: README, LLM context, roadmap, and specs updated when archived.
