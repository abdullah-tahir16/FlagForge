## Context

FlagForge now has the core flag loop:

```text
Dashboard config -> Evaluation API -> JavaScript SDK -> application behavior
```

The missing product loop is visibility. Teams need to know whether flags are being evaluated, how often they return true or false, and which flags are active in each environment.

Current constraints:

- Evaluation requests already authenticate with environment SDK keys.
- Evaluation responses already include project/environment metadata, flag keys, boolean values, and reason metadata.
- PostgreSQL is the durable store for product data.
- Redis is optional evaluation-cache infrastructure, not a general event bus.
- Dashboard UI must remain token-driven, compact, and operational.

## Goals / Non-Goals

**Goals:**

- Record SDK evaluation activity after successful SDK authentication.
- Preserve evaluation API correctness and safe response behavior if analytics writes fail.
- Store enough event data to aggregate by project, environment, flag, reason, and boolean result.
- Provide authenticated project analytics read APIs with bounded time windows.
- Add a compact project analytics dashboard view.
- Keep the implementation local and understandable for the MVP.

**Non-Goals:**

- No external queue, Kafka, background worker process, or Redis Stream.
- No user-level tracking, user profile analytics, or raw context storage.
- No analytics event export pipeline.
- No billing, quotas, alerts, or anomaly detection.
- No SDK-side analytics batching; the backend records evaluation outcomes.
- No long-term warehouse design.

## Decisions

### Event storage

Add a PostgreSQL `evaluation_events` table through TypeORM migration/entity.

Each event stores:

- `organizationId`
- `projectId`
- `environmentId`
- `sdkKeyId`
- `flagKey`
- `value`
- `reason`
- `evaluationType` (`SINGLE` or `ALL`)
- `occurredAt`

Do not store raw SDK keys, raw `userId`, or arbitrary context attributes.

Rationale: this supports useful aggregate dashboard queries while avoiding user/context PII and keeping the schema small.

Alternative considered: store full evaluation request/response JSON. That would simplify future debugging but creates privacy, retention, and query complexity too early.

### Recording path

Record analytics in `EvaluationsService` after evaluation results are computed. The call should be best-effort and must catch failures so evaluation responses are not impacted.

For all-flags evaluation, record one event per evaluated flag in a single bulk operation.

Rationale: per-flag events make true/false split, reason counts, top flags, and flag-specific charts straightforward. A request-level aggregate would lose flag-level detail.

Alternative considered: record only request-level events. Cheaper, but not useful enough for flag analytics.

### Query API

Add authenticated project-scoped analytics endpoints under:

```text
GET /api/v1/projects/:projectId/analytics/overview
```

Filters:

- optional `environmentId`
- optional `flagKey`
- optional bounded range such as `24h`, `7d`, or `30d`

The overview response should include:

- total evaluations
- true count
- false count
- top flags by evaluation count
- reason breakdown
- time buckets for charting

Rationale: one overview endpoint is enough for the first dashboard view and avoids premature API fragmentation.

### Dashboard UI

Add a project analytics route, likely:

```text
/projects/:projectId/analytics
```

The UI should use existing dashboard shell, common primitives, semantic theme tokens, dense metric panels, filter controls, and simple chart/list visuals. Avoid adding a chart dependency unless implementation proves the local UI primitives are insufficient.

### Retention

For MVP, document a default analytics query window and keep stored events durable. The API should bound query windows to prevent unbounded scans. Automatic deletion/retention jobs are out of scope unless needed during implementation.

## Risks / Trade-offs

- [Write amplification] All-flags evaluation writes one event per flag -> Use bulk inserts and keep the schema narrow.
- [Evaluation latency] Analytics writes could slow SDK responses -> Make recording best-effort and isolate failures.
- [Data growth] Event table can grow quickly -> Bound read windows now; schedule retention as a follow-up if needed.
- [Privacy] Context/user identifiers could leak into analytics -> Do not persist raw SDK keys, raw user ids, or arbitrary context.
- [Dashboard chart quality] No chart dependency limits visualization polish -> Use compact bars/time buckets first; revisit a chart library only if needed.

## Migration Plan

1. Add the analytics table migration and entity.
2. Add analytics service write path and read aggregation methods.
3. Wire evaluation service to record events after successful evaluations.
4. Add authenticated analytics controller endpoint.
5. Add dashboard route and UI.
6. Update docs and seed/demo guidance.

Rollback: remove dashboard route/API usage first, then stop recording analytics events. Existing event rows can remain harmless until a later cleanup migration.
