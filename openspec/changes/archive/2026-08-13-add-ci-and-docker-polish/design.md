## Context

FlagForge is now a multi-package pnpm workspace with a NestJS backend, Vite React frontend, JavaScript SDK package, PostgreSQL, Redis, TypeORM migrations, seed data, and OpenSpec-managed requirements. The root commands already provide local verification, but there is no committed CI workflow and Docker Compose currently runs only persistence infrastructure.

This change should make verification and containerized demos repeatable without changing product behavior. The project expects Node `>=26.7.0` and pnpm `11.21.0`; CI and container images should align with those pinned versions rather than normalizing around the older local shell version.

## Goals / Non-Goals

**Goals:**

- Add CI that installs pnpm through Corepack and runs the same root checks developers use locally.
- Validate OpenSpec state in CI so archived/current specs stay coherent.
- Build runtime containers for backend and frontend with reproducible dependency installation.
- Extend Docker Compose to run PostgreSQL, Redis, backend, and frontend together with health checks and predictable ports.
- Keep env examples and README instructions clear for both local development and containerized demo operation.
- Provide a lightweight smoke-check path that proves the full stack can boot and serve the health/API/dashboard flow.

**Non-Goals:**

- No cloud deployment target, registry publishing, Kubernetes manifests, Terraform, or production secrets management.
- No change to application feature behavior, evaluation semantics, auth model, or database schema.
- No CI matrix beyond the pinned Node/pnpm version unless a specific compatibility need emerges.
- No frontend E2E framework dependency unless the smoke-check scope proves it is worth the extra installation/runtime cost.

## Decisions

### CI Uses Root Workspace Commands

The GitHub Actions workflow should run `corepack pnpm install --frozen-lockfile`, `corepack pnpm build`, `corepack pnpm test`, and `corepack pnpm lint` from the repo root.

Rationale: those commands already include backend, frontend, and SDK package checks. Running package-specific commands independently would duplicate root orchestration and make future workspace packages easier to forget.

Alternative considered: split backend/frontend/SDK jobs. That can be added later for speed, but one root verification job is simpler and better matches current repo maturity.

### CI Runs OpenSpec Validation

CI should run `openspec validate --all --strict` if supported by the local CLI version; otherwise it should run strict validation for active changes and specs using available commands.

Rationale: this repo’s planning and behavior contracts live in OpenSpec. Build/test/lint alone can pass while spec files are malformed.

Alternative considered: validate only active changes. That misses archived spec drift and should not be the default once the project has many archived changes.

### Docker Builds Runtime Images Per App

The backend and frontend should each have their own Dockerfile. The backend image should build TypeScript and run the NestJS compiled output. The frontend image should build static assets and serve them through a small HTTP server such as nginx.

Rationale: the apps have different runtime needs and release surfaces. Separate images keep the backend Node runtime away from the frontend static serving path.

Alternative considered: one monolithic image running both apps. That is simpler to start but blurs app boundaries and makes scaling/debugging less realistic.

### Compose Keeps Dev Infrastructure and Adds Full-Stack Profile

Docker Compose should preserve existing `postgres` and `redis` services and add backend/frontend services in a way that supports full-stack local operation. If profile support is used, the default infrastructure workflow must remain documented.

Rationale: existing users already rely on `docker compose up -d postgres redis` plus `pnpm dev`. The new full-stack flow should not make that worse.

Alternative considered: replace compose with an app-only production compose file. That would fragment local documentation too early.

### Migrations Run Before Backend Serves Traffic

The containerized backend should run TypeORM migrations on startup or have a documented one-shot migration command in the compose flow. Seeding should remain explicit for demo data.

Rationale: containerized startup without schema readiness is brittle. Demo seed data should remain opt-in because it creates local credentials and sample resources.

Alternative considered: `synchronize: true` in containers. That is inappropriate for a production-oriented path and conflicts with existing migration-based guidance.

## Risks / Trade-offs

- Node `26.7.0` container availability may lag package manager expectations → use an official image tag that satisfies `>=26.7.0` and document the exact chosen tag.
- Native dependencies such as `argon2` can fail if build/runtime stages use incompatible Linux bases → keep build and runtime image families compatible.
- Frontend API base URL is a build-time Vite variable → document the value used for local compose and avoid runtime-config promises unless implemented deliberately.
- Running migrations on every backend start can hide migration failures in logs → health checks and README troubleshooting should make failed startup visible.
- Full-stack smoke checks can become slow or flaky → keep smoke checks small and use health/API assertions before browser automation.
