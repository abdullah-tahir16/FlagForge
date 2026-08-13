## 1. Documentation and Planning Alignment

- [x] 1.1 Read `LLM_CONTEXT.md`, current SDK/evaluation README sections, and the archived boolean feature flag artifacts before implementation.
- [x] 1.2 Update `docs/ROADMAP.md` so `add-boolean-feature-flags` is archived and `add-sdk-keys-and-evaluation-api` is active.
- [x] 1.3 Update `README.md` local workflow, endpoint list, and curl examples if SDK key or evaluation behavior changes local usage.

## 2. Backend SDK Key Data Model

- [x] 2.1 Add `SdkKey` TypeORM entity scoped to environments.
- [x] 2.2 Add environment relationship for SDK keys with cascade behavior matching the design.
- [x] 2.3 Add migration for `sdk_keys` table, indexes, unique constraints if needed, and foreign key to environments.
- [x] 2.4 Register the SDK key entity in TypeORM configuration and `SdkKeysModule`.
- [x] 2.5 Add helpers for secure key generation, SHA-256 hashing, prefix extraction, and safe response shaping.

## 3. Backend SDK Key Management API

- [x] 3.1 Add DTOs for create SDK key, SDK key metadata response, and create response with one-time secret.
- [x] 3.2 Implement environment ownership lookup through project and environment checks.
- [x] 3.3 Implement authenticated SDK key creation with raw secret returned only in the create response.
- [x] 3.4 Implement authenticated SDK key listing without raw secret or hash fields.
- [x] 3.5 Implement authenticated SDK key revocation by setting `revokedAt`.
- [x] 3.6 Reject management access to environments or keys outside the current user's organization.
- [x] 3.7 Add authenticated controller routes under `/api/v1/projects/:projectId/environments/:environmentId/sdk-keys`.

## 4. Backend Evaluation API

- [x] 4.1 Add SDK authentication service that reads `X-FlagForge-Key`, hashes it, rejects missing/invalid/revoked keys, and loads environment/project context.
- [x] 4.2 Add unit-testable boolean evaluation service that resolves feature flags and environment configs.
- [x] 4.3 Implement single flag evaluation endpoint at `POST /api/v1/sdk/evaluate/:flagKey`.
- [x] 4.4 Implement all flags evaluation endpoint at `POST /api/v1/sdk/evaluate`.
- [x] 4.5 Return safe `false` values with reason metadata for disabled, missing flag, and missing config cases.
- [x] 4.6 Update `lastUsedAt` when an active SDK key successfully authenticates an evaluation request.
- [x] 4.7 Ensure SDK evaluation responses expose only client-safe flag, environment, and reason metadata.

## 5. Backend Tests and Seed Data

- [x] 5.1 Add SDK key service tests for create/list/revoke, one-time secret response, hash-only persistence, and cross-organization rejection.
- [x] 5.2 Add SDK key controller tests for route wiring, auth guard usage, DTO forwarding, and response shape.
- [x] 5.3 Add evaluation auth tests for missing, invalid, revoked, and valid SDK keys.
- [x] 5.4 Add evaluation service tests for enabled flag, disabled flag, missing flag, missing config, and all-flags responses.
- [x] 5.5 Extend the idempotent seed script with a repeatable local SDK key creation path or printed demo key guidance.

## 6. Frontend SDK Key Domain and API Layer

- [x] 6.1 Add `core/types/SdkKey` types for metadata, create input, create result, and revocation state.
- [x] 6.2 Add `infrastructure/api/SdkKey` API functions and transport DTO types.
- [x] 6.3 Add TanStack Query hooks for list, create, and revoke SDK key operations.
- [x] 6.4 Add `useSdkKeyUseCase` orchestration with query invalidation and mutation state.
- [x] 6.5 Add Zod validation schema for SDK key creation under the relevant presentation hook folder.

## 7. Frontend SDK Key Dashboard UX

- [x] 7.1 Add SDK key management UI to the project environment surface without adding page-local navigation.
- [x] 7.2 Add a React Final Form create form using common form controls and Zod validation.
- [x] 7.3 Add dense SDK key rows with prefix, name, created, last used, revoked state, and revoke action.
- [x] 7.4 Add one-time full key display with copy action immediately after successful creation.
- [x] 7.5 Add themed revoke confirmation using `ConfirmDialog`.
- [x] 7.6 Use `PageHeader`, `Toolbar`, `Badge`, `Alert`, `EmptyState`, `Skeleton`, `ConfirmDialog`, `DataList`, and `DataRow` consistently where applicable.

## 8. Frontend Accessibility and Responsive Verification

- [x] 8.1 Ensure SDK key create/revoke/copy states have visible loading, disabled, error, hover, active, and focus states.
- [x] 8.2 Ensure copy controls use icons where appropriate with `aria-label` and `title`.
- [x] 8.3 Verify 375px layout for project detail environment SDK key management.
- [x] 8.4 Verify 1024px and 1440px layouts for SDK key rows, forms, dialogs, and one-time key display.
- [x] 8.5 Scan presentation code for raw palette utilities and browser `confirm`/`alert`/`prompt` usage.

## 9. Final Verification

- [x] 9.1 Run `corepack pnpm --filter @flagforge/backend test`.
- [x] 9.2 Run `corepack pnpm --filter @flagforge/frontend build`.
- [x] 9.3 Run root `corepack pnpm build`, `corepack pnpm test`, and `corepack pnpm lint`.
- [x] 9.4 Run `pnpm seed` and verify the demo workflow can obtain an SDK key.
- [x] 9.5 Verify `POST /api/v1/sdk/evaluate/:flagKey` and `POST /api/v1/sdk/evaluate` with a demo SDK key.
- [x] 9.6 Run OpenSpec status/apply checks for `add-sdk-keys-and-evaluation-api`.
- [x] 9.7 Run `openspec validate add-sdk-keys-and-evaluation-api --strict`.
