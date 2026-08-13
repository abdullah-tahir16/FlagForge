## 1. CI Workflow

- [x] 1.1 Add a GitHub Actions workflow under `.github/workflows/` for push and pull request verification.
- [x] 1.2 Configure CI to use a Node version satisfying `>=26.7.0` and activate pnpm `11.21.0` through Corepack.
- [x] 1.3 Configure CI dependency installation with `corepack pnpm install --frozen-lockfile`.
- [x] 1.4 Configure CI to run `corepack pnpm build`, `corepack pnpm test`, and `corepack pnpm lint`.
- [x] 1.5 Configure CI to run strict OpenSpec validation for active changes and main specs.

## 2. Backend Container

- [x] 2.1 Add backend Docker ignore rules that exclude local dependencies, build output, logs, and secrets.
- [x] 2.2 Add a backend Dockerfile that installs workspace dependencies reproducibly and builds the NestJS backend.
- [x] 2.3 Ensure the backend image runs compiled output with `node dist/main.js`.
- [x] 2.4 Ensure backend container startup supports environment-driven database, Redis, auth, CORS, port, and migration settings.
- [x] 2.5 Verify backend image build succeeds from the repository root.

## 3. Frontend Container

- [x] 3.1 Add frontend Docker ignore rules that exclude local dependencies, build output, logs, and secrets.
- [x] 3.2 Add a frontend Dockerfile that installs workspace dependencies reproducibly and builds the Vite dashboard.
- [x] 3.3 Serve frontend static assets from a small production HTTP server image.
- [x] 3.4 Configure the frontend build for the documented local Compose backend API URL.
- [x] 3.5 Verify frontend image build succeeds from the repository root.

## 4. Docker Compose Full Stack

- [x] 4.1 Extend Docker Compose with backend and frontend services while preserving PostgreSQL and Redis services.
- [x] 4.2 Add service dependencies and health checks for PostgreSQL, Redis, backend, and frontend readiness.
- [x] 4.3 Ensure full-stack Compose exposes the documented frontend and backend ports.
- [x] 4.4 Keep the infrastructure-only `docker compose up -d postgres redis` workflow usable for local `pnpm dev`.
- [x] 4.5 Verify the full-stack Compose startup path locally when Docker is available.

## 5. Environment and Documentation

- [x] 5.1 Update environment examples to distinguish local pnpm development values from Docker Compose values.
- [x] 5.2 Update `README.md` with Docker build, full-stack Compose, migration, seed, and smoke-check commands.
- [x] 5.3 Update `LLM_CONTEXT.md` with durable CI, Docker, and verification guidance for future changes.
- [x] 5.4 Update `docs/ROADMAP.md` to mark CI/Docker polish as active and identify likely follow-up work.

## 6. Smoke Checks

- [x] 6.1 Add a lightweight smoke-check script or documented command sequence for backend health.
- [x] 6.2 Add smoke coverage for seeded login readiness.
- [x] 6.3 Add smoke coverage for SDK evaluation using the local demo SDK key.
- [x] 6.4 Add smoke coverage for at least one authenticated read-model endpoint, such as analytics overview or audit logs.
- [x] 6.5 Ensure smoke checks fail with clear output when required services are unavailable.

## 7. Verification

- [x] 7.1 Run `openspec validate add-ci-and-docker-polish --strict`.
- [x] 7.2 Run `corepack pnpm build`.
- [x] 7.3 Run `corepack pnpm test`.
- [x] 7.4 Run `corepack pnpm lint`.
- [x] 7.5 Run Docker image build checks for backend and frontend when Docker is available.
- [x] 7.6 Run the documented full-stack Docker smoke path when Docker is available.
