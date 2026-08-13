## Why

FlagForge management screens currently rely on manual refresh and query refetch timing after flag, environment, targeting, segment, and SDK key changes. Redis cache invalidation now gives the backend a clear mutation boundary, so the next step is to notify connected clients when evaluable configuration changes.

## What Changes

- Add a backend realtime notification capability for organization/project-scoped management events.
- Publish realtime events after successful mutations that already affect evaluation cache freshness.
- Add a browser subscription path so the dashboard can react to configuration changes by invalidating TanStack Query caches.
- Keep realtime best-effort: mutation success must not depend on connected clients or event delivery.
- Document connection lifecycle, event shape, and fallback behavior.
- Leave collaborative editing, presence, Redis Pub/Sub fanout across multiple backend instances, and SDK streaming updates out of scope.

## Capabilities

### New Capabilities

- `realtime-update-management`: Backend-to-dashboard realtime event delivery, event envelope, authorization, client subscription behavior, and best-effort guarantees.

### Modified Capabilities

- `dashboard-ui-foundation`: Dashboard data should refresh from realtime configuration events without requiring manual reload.
- `feature-flag-management`: Feature flag and environment config mutations publish realtime configuration events after successful writes.
- `targeting-rule-management`: Targeting rule mutations publish realtime configuration events after successful writes.
- `segment-management`: Segment and segment condition mutations publish realtime configuration events after successful writes.

## Impact

- Backend: realtime module/controller or gateway, event publisher service, auth checks for subscriptions, mutation-service publishing hooks, tests.
- Frontend: realtime client hook/provider, dashboard query invalidation on received events, lifecycle cleanup, fallback behavior when disconnected.
- API: new realtime subscription endpoint; existing management mutation responses remain unchanged.
- Infrastructure: no required new external service for the MVP; Redis Pub/Sub fanout is deferred unless needed later.
- Docs/OpenSpec: README, LLM context, roadmap, and specs updated when archived.
