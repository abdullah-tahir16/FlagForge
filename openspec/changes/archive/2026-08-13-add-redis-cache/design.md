## Context

FlagForge now evaluates boolean flags using environment configuration, ordered segment-source rules, direct attribute rules, percentage rollout, and static values. Each SDK evaluation request currently queries PostgreSQL for the relevant flag configuration and related rule/segment graph.

Redis is already part of the README architecture vision and is the next step before realtime updates and SDK packaging. The cache must improve SDK evaluation performance without changing evaluation semantics or making management writes unsafe.

## Goals / Non-Goals

**Goals:**

- Add a backend Redis cache layer for evaluable environment flag configuration snapshots.
- Keep SDK evaluation response shapes and decision semantics unchanged.
- Let evaluation read a complete environment snapshot from Redis when available.
- Rebuild and store the snapshot from PostgreSQL on cache miss.
- Invalidate affected environment snapshots after management mutations that can change evaluation results.
- Gracefully fall back to PostgreSQL if Redis is unavailable, misconfigured, or returns invalid data.
- Add local Redis development configuration and tests for cache hit, miss, fallback, and invalidation behavior.

**Non-Goals:**

- Realtime WebSocket or Redis pub/sub fanout.
- SDK-side local caching.
- Analytics/event buffering in Redis.
- Multi-variant flag payloads.
- Distributed locks or background cache warming jobs.
- Redis Cluster/Sentinel operational topology.

## Decisions

### Cache complete environment snapshots

The cache SHALL store one JSON snapshot per environment:

```text
flagforge:evaluation:v1:environment:<environmentId>
```

The snapshot contains the project id, environment metadata, all boolean flags for that environment, environment config values, ordered targeting rules, referenced segment metadata, and segment conditions needed for evaluation.

Alternative considered: cache per-flag records. Per-flag records reduce invalidation size, but all-flags evaluation would still need multiple round trips and segment changes could require many point invalidations. One environment snapshot keeps SDK reads simple and coherent.

### Cache miss rebuilds from PostgreSQL

Evaluation SHALL try Redis first, then load from PostgreSQL and write the snapshot back to Redis when the key is missing or invalid. The all-flags and single-flag APIs use the same snapshot loader so behavior stays aligned.

Alternative considered: eagerly rebuild cache during every management mutation. That makes writes slower and introduces more failure paths. Delete-on-write invalidation is enough for the MVP.

### Redis is performance infrastructure, not correctness infrastructure

If Redis is unavailable, times out, contains corrupt JSON, or has an incompatible cache version, evaluation SHALL ignore the cache and use PostgreSQL. The request should not fail solely because Redis is unhealthy.

Alternative considered: require Redis for SDK evaluation. That would be faster under normal conditions but creates an unnecessary local/dev and production availability dependency before the system has operational maturity.

### Use explicit invalidation hooks in domain services

Mutation services that change evaluable configuration SHALL invalidate affected environment snapshots after successful writes:

- feature flag create/update/delete
- environment flag config update
- targeting rule create/update/delete/reorder
- segment update/delete
- segment condition create/update/delete/reorder

For segment mutations, invalidation SHALL target environments with targeting rules that reference the affected segment. If a segment is not referenced by any rule, no environment cache needs invalidation.

Alternative considered: TypeORM subscribers. They are easy to miss in tests and make cache effects implicit. Service-level invalidation is more visible and matches current audit event patterns.

### Keep cache payloads versioned

Cache values SHALL include a schema version. The Redis key also contains a version segment (`v1`). Future shape changes can invalidate old cache values by bumping the key namespace or rejecting mismatched payload versions.

### Bound cache lifetime

Environment snapshots SHALL use a configurable TTL. The TTL is a backstop for missed invalidations and local development hygiene, not the primary freshness mechanism.

## Risks / Trade-offs

- [Risk] Stale flags after management mutation. -> Invalidate affected environment keys after successful mutation and use TTL as a safety net.
- [Risk] Redis outage causing SDK API failures. -> Treat Redis as optional and fall back to PostgreSQL.
- [Risk] Cached snapshot shape drifts from entity shape. -> Map through explicit cache DTOs and version the payload.
- [Risk] Segment mutation invalidation is broader than needed. -> Query referenced targeting rules and invalidate the environments that use those rules; broad project invalidation is acceptable only as a fallback.
- [Risk] Caching large environments can produce large Redis values. -> Keep payload limited to evaluation fields and leave compression/chunking out until there is data showing a need.

## Migration Plan

1. Add Redis service to Docker Compose and Redis env vars to example files.
2. Add backend Redis/cache module with optional connection behavior.
3. Add environment snapshot mapper and loader.
4. Update evaluation service to use snapshot loader for single and all flag evaluation.
5. Add invalidation calls to management mutation services.
6. Add tests for cache hit, miss, fallback, invalidation, and unchanged evaluation semantics.
7. Update README, LLM context, and roadmap with cache behavior.

Rollback can disable Redis by removing or blanking Redis env configuration; SDK evaluation must continue through PostgreSQL fallback.

## Open Questions

- What default TTL should local development use: short enough to reveal invalidation bugs, or long enough to make cache hits obvious?
- Should the cache service expose a lightweight health indicator now, or defer cache observability to a later operational change?
