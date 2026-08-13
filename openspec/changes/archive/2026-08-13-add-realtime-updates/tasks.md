## 1. Backend Realtime Foundation

- [x] 1.1 Create backend realtime module structure with event envelope types and resource/action enums.
- [x] 1.2 Add an in-memory realtime publisher/subscriber service with organization-scoped subscriber registration.
- [x] 1.3 Add a stream controller endpoint that authenticates with existing Bearer access tokens and returns `text/event-stream`.
- [x] 1.4 Add heartbeat frames and clean subscriber removal on disconnect.
- [x] 1.5 Ensure publisher failures are handled without leaking stream internals to API clients.

## 2. Backend Mutation Publishing

- [x] 2.1 Publish configuration events after feature flag creation, metadata update, config update, and deletion.
- [x] 2.2 Publish configuration events after targeting rule create, update, delete, and reorder.
- [x] 2.3 Publish configuration events after segment metadata and match mode updates.
- [x] 2.4 Publish configuration events after segment condition create, update, delete, and reorder.
- [x] 2.5 Include organization id, project id, affected environment ids, resource type, resource id, action, and timestamp in every mutation event.

## 3. Frontend Realtime Client

- [x] 3.1 Add a frontend realtime API client that opens a fetch-based SSE stream with the current access token.
- [x] 3.2 Add stream parsing helpers for SSE event frames and JSON event payloads.
- [x] 3.3 Add a realtime TanStack/use-case hook that starts when a user is authenticated and closes on logout/unmount.
- [x] 3.4 Add bounded reconnect behavior when the stream disconnects while the user remains authenticated.
- [x] 3.5 Keep dashboard usable when the realtime stream is unavailable.

## 4. Frontend Query Invalidation

- [x] 4.1 Invalidate project flag list/detail queries when a matching configuration event arrives.
- [x] 4.2 Invalidate targeting rule queries for affected flag environment configurations when a matching event arrives.
- [x] 4.3 Invalidate segment list/detail/options queries when a matching segment event arrives.
- [x] 4.4 Invalidate audit log queries after matching configuration events.
- [x] 4.5 Ignore realtime events for other organizations or projects.

## 5. Tests

- [x] 5.1 Add backend tests for authenticated stream registration, unauthenticated rejection, heartbeat, and disconnect cleanup.
- [x] 5.2 Add backend tests for organization-scoped event delivery and cross-organization filtering.
- [x] 5.3 Add backend service tests proving management mutations publish expected configuration events.
- [x] 5.4 Add backend tests proving realtime publish failures do not fail management mutations.
- [x] 5.5 Add frontend tests or type-level coverage for SSE frame parsing and event payload handling.
- [x] 5.6 Add frontend tests or focused coverage for query invalidation decisions on received realtime events.

## 6. Documentation

- [x] 6.1 Update `README.md` with realtime stream behavior, fallback behavior, and local development notes.
- [x] 6.2 Update `LLM_CONTEXT.md` with durable realtime architecture and SSE/fetch auth guidance.
- [x] 6.3 Update `docs/ROADMAP.md` to reflect realtime progress and the next likely JavaScript SDK step.

## 7. Verification

- [x] 7.1 Run `openspec validate add-realtime-updates --strict`.
- [x] 7.2 Run `corepack pnpm build`.
- [x] 7.3 Run `corepack pnpm test`.
- [x] 7.4 Run `corepack pnpm lint`.
- [x] 7.5 Run a local startup smoke check and confirm the realtime stream endpoint can connect when authenticated, if feasible.
