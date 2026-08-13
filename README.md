# FlagForge — Feature Flag Platform

## Features

FlagForge is a multi-tenant feature-flag management platform with a NestJS API, a React dashboard, and a JavaScript SDK.

- **Organizations & projects** — organization-scoped projects, each with Development/Staging/Production environments.
- **Boolean feature flags** — per-environment enable/disable and served value, with atomic default configuration on creation.
- **Percentage rollouts** — deterministic, per-environment rollout buckets with safe fallback when evaluation context is incomplete.
- **Targeting rules** — ordered, first-match rules per environment configuration, matching either a direct attribute condition or a reusable segment.
- **Segments** — reusable, project-scoped user segments with ordered attribute conditions and match-all/match-any modes.
- **SDK keys & JavaScript SDK** — hashed environment SDK keys and a typed `@flagforge/js-sdk` client with safe defaults on network failure.
- **Redis evaluation cache** — one versioned evaluation snapshot per environment, with automatic invalidation on mutation and PostgreSQL fallback.
- **Realtime dashboard updates** — authenticated Server-Sent Events stream that invalidates dashboard caches on configuration changes.
- **Audit log** — organization-scoped, filterable, paginated audit trail for management operations, including resolved project/environment names.
- **Evaluation analytics** — best-effort, privacy-safe evaluation event recording with a project-level overview (totals, top flags, reason breakdown, time buckets).
- **OpenAPI docs** — interactive API reference at `/api/docs`, generated from the real controllers and DTOs.

## Local Development

FlagForge uses a pnpm workspace with two applications:

```text
frontend/
backend/
```

Required local tools:

```text
Node.js 26.7.0
pnpm 11.21.0
Docker
```

Quick start:

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
pnpm install
docker compose up -d postgres redis
pnpm seed
pnpm dev
```

Full-stack Docker demo:

```bash
cp .env.docker.example .env
docker compose up --build -d
docker compose exec backend node dist/common/database/seeds/seed-demo-user.js
pnpm smoke
```

Use `.env.example` for host-based `pnpm dev`. Use `.env.docker.example` for full-stack Docker Compose. Both flows keep the same local URLs.

Local URLs:

```text
Frontend:    http://localhost:5174
Backend:     http://localhost:3001/api/v1
Health:      http://localhost:3001/api/v1/health
API docs:    http://localhost:3001/api/docs
```

Docker image build checks:

```bash
docker build -f backend/Dockerfile -t flagforge-backend .
docker build -f frontend/Dockerfile \
  --build-arg VITE_API_BASE_URL=http://localhost:3001/api/v1 \
  -t flagforge-frontend .
```

Full-stack Docker Compose starts PostgreSQL, Redis, the NestJS API, and the static frontend dashboard:

```bash
docker compose up --build -d
docker compose ps
```

The backend container runs TypeORM migrations when `TYPEORM_MIGRATIONS_RUN=true`. Demo seed data remains explicit:

```bash
docker compose exec backend node dist/common/database/seeds/seed-demo-user.js
```

Smoke check:

```bash
pnpm smoke
```

The smoke check verifies backend health, frontend reachability, seeded login, SDK evaluation with the local demo SDK key, and analytics overview access. Override URLs or credentials with:

```text
FLAGFORGE_API_URL=http://localhost:3001/api/v1
FLAGFORGE_FRONTEND_URL=http://localhost:5174
FLAGFORGE_DEMO_EMAIL=user@example.com
FLAGFORGE_DEMO_PASSWORD=password123
FLAGFORGE_DEMO_SDK_KEY=ff_development_sk_local_demo_key
```

CI runs the same root verification commands:

```bash
openspec validate --all --strict
corepack pnpm build
corepack pnpm test
corepack pnpm lint
```

Local demo credentials after running `pnpm seed`:

```text
Email:    user@example.com
Password: password123
```

The login and registration screens show these credentials only when `VITE_SHOW_DEMO_CREDENTIALS=true` (the default in both `frontend/.env.example` and `.env.docker.example`) — unset it for a build where local demo credentials shouldn't be visible.

Current management API endpoints:

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/refresh
POST /api/v1/auth/logout
GET  /api/v1/auth/me

GET   /api/v1/organizations/current
PATCH /api/v1/organizations/current

GET    /api/v1/projects
POST   /api/v1/projects
GET    /api/v1/projects/:projectId
PATCH  /api/v1/projects/:projectId
DELETE /api/v1/projects/:projectId

GET   /api/v1/projects/:projectId/environments
PATCH /api/v1/projects/:projectId/environments/:environmentId

GET    /api/v1/projects/:projectId/flags
POST   /api/v1/projects/:projectId/flags
GET    /api/v1/projects/:projectId/flags/:flagId
PATCH  /api/v1/projects/:projectId/flags/:flagId
DELETE /api/v1/projects/:projectId/flags/:flagId
PATCH  /api/v1/projects/:projectId/flags/:flagId/environments/:environmentId
GET    /api/v1/projects/:projectId/flags/:flagId/environments/:environmentId/rules
POST   /api/v1/projects/:projectId/flags/:flagId/environments/:environmentId/rules
PATCH  /api/v1/projects/:projectId/flags/:flagId/environments/:environmentId/rules/:ruleId
DELETE /api/v1/projects/:projectId/flags/:flagId/environments/:environmentId/rules/:ruleId
POST   /api/v1/projects/:projectId/flags/:flagId/environments/:environmentId/rules/reorder

GET    /api/v1/projects/:projectId/segments
GET    /api/v1/projects/:projectId/segments/options
POST   /api/v1/projects/:projectId/segments
GET    /api/v1/projects/:projectId/segments/:segmentId
PATCH  /api/v1/projects/:projectId/segments/:segmentId
DELETE /api/v1/projects/:projectId/segments/:segmentId
POST   /api/v1/projects/:projectId/segments/:segmentId/conditions
PATCH  /api/v1/projects/:projectId/segments/:segmentId/conditions/:conditionId
DELETE /api/v1/projects/:projectId/segments/:segmentId/conditions/:conditionId
POST   /api/v1/projects/:projectId/segments/:segmentId/conditions/reorder

GET    /api/v1/projects/:projectId/environments/:environmentId/sdk-keys
POST   /api/v1/projects/:projectId/environments/:environmentId/sdk-keys
DELETE /api/v1/projects/:projectId/environments/:environmentId/sdk-keys/:sdkKeyId

GET /api/v1/audit

GET /api/v1/realtime/events

GET /api/v1/projects/:projectId/analytics/overview

POST /api/v1/sdk/evaluate/:flagKey
POST /api/v1/sdk/evaluate
```

An interactive reference for these endpoints, generated from the real controllers and DTOs, is served at `/api/docs` (e.g. `http://localhost:3001/api/docs`). Dashboard routes authenticate with the bearer access token returned by `/auth/login`/`/auth/register`; paste it into the Swagger UI "Authorize" dialog to exercise protected routes. The `POST /sdk/evaluate*` routes authenticate with an `X-FlagForge-Key` header instead.

Authentication uses a short-lived access token returned in JSON and a rotating refresh token stored as an httpOnly cookie. The refresh token is stored only as a hash in PostgreSQL and is not exposed to frontend JavaScript.

The demo seed creates the `Demo Labs` organization, `Checkout Platform` project, Development, Staging, and Production environments, plus `New Checkout` and `Beta Navigation` boolean feature flags for local dashboard testing. `New Checkout` includes representative rollout percentages: Development 25%, Staging 50%, and Production 0%. It also creates reusable `Premium Italian Users` and `Internal Employees` segments, ordered segment conditions, segment-source targeting rules, representative audit entries, and this local Development SDK key:

```text
ff_development_sk_local_demo_key
```

Local evaluation example:

```bash
curl -X POST http://localhost:3001/api/v1/sdk/evaluate/new-checkout \
  -H "Content-Type: application/json" \
  -H "X-FlagForge-Key: ff_development_sk_local_demo_key" \
  -d '{"userId":"user-123"}'

curl -X POST http://localhost:3001/api/v1/sdk/evaluate \
  -H "Content-Type: application/json" \
  -H "X-FlagForge-Key: ff_development_sk_local_demo_key" \
  -d '{"userId":"user-123"}'
```

JavaScript SDK local example:

```typescript
import { createFlagForgeClient } from "@flagforge/js-sdk";

const flagForge = createFlagForgeClient({
  apiUrl: "http://localhost:3001/api/v1",
  sdkKey: "ff_development_sk_local_demo_key",
  timeoutMs: 3000
});

const enabled = await flagForge.isEnabled("new-checkout", {
  country: "IT",
  plan: "premium",
  userId: "user-123"
});

const detail = await flagForge.evaluate("new-checkout", { userId: "user-123" });
const allFlags = await flagForge.evaluateAll({ userId: "user-123" });
```

The SDK sends the SDK key through `X-FlagForge-Key`, passes primitive context attributes to the evaluation API, and returns safe fallback values for network errors, timeouts, unauthorized responses, server errors, or malformed responses.

SDK evaluation request bodies accept `userId` for percentage rollout bucketing and additional primitive context attributes for targeting rules and segment membership. Evaluation order is: disabled config, segment-source targeting rules, direct attribute targeting rules, percentage rollout fallback, then static configured value. Partial rollouts without `userId` fail safely to `false` with `ROLLOUT_CONTEXT_MISSING`.

Redis is used as optional performance infrastructure for SDK evaluation. When `REDIS_URL` or `REDIS_HOST`/`REDIS_PORT` is configured, the backend caches one complete evaluable snapshot per environment under a versioned key:

```text
flagforge:evaluation:v1:environment:<environmentId>
```

Local cache variables:

```text
REDIS_URL=redis://localhost:6379
REDIS_HOST=localhost
REDIS_PORT=6379
EVALUATION_CACHE_TTL_SECONDS=300
```

On cache miss, invalid JSON, unsupported cache schema version, or Redis outage, evaluation falls back to PostgreSQL and preserves the same response semantics. Management mutations that can change evaluation results delete affected environment snapshot keys after successful writes.

Dashboard realtime updates use an authenticated fetch-based Server-Sent Events stream:

```text
GET /api/v1/realtime/events
Authorization: Bearer <access-token>
```

The stream publishes best-effort `CONFIGURATION_CHANGED` events for feature flag, environment flag config, targeting rule, segment, and segment condition mutations. Events include organization id, project id, affected environment ids, resource type, resource id, action, and timestamp. The React dashboard listens while authenticated and invalidates matching TanStack Query caches for flags, targeting rules, segments, and audit logs. If the stream disconnects or cannot connect, the dashboard remains usable and retries with bounded backoff.

Analytics records one PostgreSQL event after each SDK evaluation result is computed. Single-flag evaluation records one event; all-flags evaluation records one event per returned flag. Analytics writes are best effort: a failed analytics insert must not change an SDK response.

Analytics events store project, environment, SDK key id, flag key, served boolean value, evaluation reason, evaluation type, and occurrence time. They intentionally do not store raw SDK keys, raw user ids, or arbitrary evaluation context attributes.

Project analytics overview is available from the dashboard and through:

```text
GET /api/v1/projects/:projectId/analytics/overview?range=7d
```

Supported ranges are `24h`, `7d`, and `30d`; the default is `7d`. Optional filters are `environmentId` and `flagKey`. The response includes total evaluations, true/false counts, top flags, reason breakdown, and time buckets.

## Project Progress

FlagForge is managed through OpenSpec changes. The high-level roadmap is tracked in [docs/ROADMAP.md](docs/ROADMAP.md).
Dashboard UI and UX rules are tracked in [docs/DASHBOARD_UI_UX.md](docs/DASHBOARD_UI_UX.md).

Current workflow:

```text
plan change -> implement tasks -> verify -> archive -> start next change
```
