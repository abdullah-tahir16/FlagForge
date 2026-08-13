## Context

FlagForge now has stable management mutation boundaries: successful writes emit audit events and invalidate Redis evaluation snapshots. The dashboard still depends on local mutation responses, TanStack Query invalidation, and periodic/manual refresh. A second browser or tab can change flag configuration without other open dashboards learning about it.

The current frontend stores the short-lived access token in memory and sends it as a Bearer token through the API client. Native `EventSource` cannot set Authorization headers, so a browser subscription that needs existing auth should use `fetch` with a readable stream rather than putting access tokens in query strings.

## Goals / Non-Goals

**Goals:**

- Add best-effort backend-to-dashboard realtime configuration events.
- Authorize subscriptions with the existing access token model.
- Let the dashboard invalidate relevant TanStack Query caches when project configuration changes elsewhere.
- Reuse the same service-level mutation boundaries that already drive Redis evaluation cache invalidation.
- Keep management mutations successful if realtime delivery fails or no clients are connected.
- Keep the implementation local-process friendly for the MVP.

**Non-Goals:**

- SDK streaming updates.
- Presence, collaborative editing, cursors, or conflict-free editing.
- Redis Pub/Sub fanout across multiple backend instances.
- Guaranteed event delivery, replay, durable event logs, or exactly-once semantics.
- A new database table for realtime events.

## Decisions

### Use fetch-based Server-Sent Events for the MVP

The realtime endpoint SHALL stream `text/event-stream` data, but the frontend SHALL consume it with `fetch` and `ReadableStream` parsing so it can set the existing `Authorization: Bearer <token>` header.

Alternative considered: native `EventSource`. It provides automatic reconnection, but cannot set custom auth headers in browsers and would force weaker query-token or cookie changes.

Alternative considered: WebSocket gateway. WebSockets are useful for bidirectional collaboration and SDK streaming, but the current dashboard need is one-way "configuration changed; refetch relevant data." SSE keeps the first realtime slice smaller and easier to verify.

### Publish domain-level configuration events after successful writes

Mutation services SHALL publish events after successful writes, audit emission, and cache invalidation. Event delivery is not part of mutation correctness, so publisher errors SHALL be handled without failing the API request.

Events SHALL use a stable envelope:

```json
{
  "id": "event-id",
  "type": "CONFIGURATION_CHANGED",
  "organizationId": "org-id",
  "projectId": "project-id",
  "environmentIds": ["environment-id"],
  "resourceType": "FEATURE_FLAG",
  "resourceId": "resource-id",
  "action": "UPDATED",
  "occurredAt": "2026-08-13T00:00:00.000Z"
}
```

The frontend should not depend on every field to update exact rows. The event is primarily a query invalidation signal scoped by organization, project, and optional environment ids.

### Keep the publisher in-process first

The MVP SHALL maintain subscribers in memory in the backend process. This is enough for local development and a single-instance deployment.

Alternative considered: Redis Pub/Sub. It fits multi-instance fanout, but adds operational behavior that is not necessary until there is a deployment target requiring multiple backend instances. The event envelope and publisher interface should make a later Redis adapter straightforward.

### Invalidate frontend queries conservatively

On a configuration event, the dashboard SHALL invalidate project-scoped queries that can show stale data: project flags, selected flag detail, targeting rules, segments/options, SDK keys when environment scope is present, audit logs, and health/status only if relevant. It is acceptable to invalidate broader project caches for the MVP.

Alternative considered: patch local query data from the event payload. That requires richer payloads and duplicate transformation logic. Refetching keeps correctness simple.

### Reconnect with backoff and degrade silently

The frontend realtime client SHALL reconnect with bounded backoff while an authenticated user is present. If the stream cannot connect, the dashboard remains usable through existing query and mutation flows.

## Risks / Trade-offs

- [Risk] In-memory subscribers do not receive events from other backend instances. -> Keep this explicit in docs and defer Redis Pub/Sub adapter to a later scaling change.
- [Risk] Browser stream parsing is more custom than native `EventSource`. -> Keep parser isolated in one infrastructure hook/client and cover event parsing/reconnect behavior with focused tests where practical.
- [Risk] Too-broad frontend invalidation can refetch more data than necessary. -> Scope by organization/project first and tighten later if performance data warrants it.
- [Risk] Long-lived streams can hold stale access tokens. -> Reconnect on auth refresh/logout and close streams when the app shell unmounts or user logs out.
- [Risk] Proxy/server buffering could delay events. -> Set standard SSE headers and keep heartbeat comments.

## Migration Plan

1. Add backend realtime event types, publisher service, and stream endpoint.
2. Wire configuration mutation services to publish events after cache invalidation.
3. Add frontend realtime stream client and app-shell subscription lifecycle.
4. Invalidate relevant TanStack Query caches on received events.
5. Add tests for auth, event filtering, publish failure tolerance, and frontend query invalidation.
6. Document local behavior and single-instance limitations.

Rollback can disable the frontend subscription or leave the backend endpoint unused; existing mutation and polling/refetch behavior remains intact.

## Open Questions

- Should SDK key creation/revocation publish realtime configuration events in this change, or only dashboard-visible management events for flags, targeting, segments, and environments?
- Should audit log screens refetch on every configuration event, or should audit receive a separate event type later?
