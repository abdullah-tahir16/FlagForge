# FlagForge Roadmap

This roadmap maps the README product vision into small OpenSpec changes. OpenSpec is the source of truth for active implementation work; this file is the high-level project board.

## Workflow

Use one focused OpenSpec change at a time:

```text
plan change -> implement tasks -> verify -> archive -> start next change
```

Recommended command rhythm:

```bash
openspec list
openspec status --change <change-name>
/opsx:ff <change-name>
/opsx:apply <change-name>
/opsx:verify <change-name>
/opsx:archive <change-name>
```

Each change should include:

```text
proposal.md   scope and motivation
design.md     key architecture decisions
spec.md       testable requirements
tasks.md      implementation checklist
```

## Status

| Order | Change | Status | Scope |
| --- | --- | --- | --- |
| 0 | `bootstrap-platform-foundation` | Archived | pnpm workspace, `frontend/`, `backend/`, NestJS, Vite, Postgres, Jest |
| 1 | `add-auth-and-organization` | Archived | registration, login, current user, organization ownership |
| 2 | `add-projects-and-environments` | Archived | project CRUD, default environments, environment management |
| 3 | `enhance-dashboard-ui-foundation` | Archived | strict dashboard UI/UX rules, shared primitives, shell, auth, projects polish |
| 4 | `add-boolean-feature-flags` | Archived | boolean flags, per-environment config, enable/disable |
| 5 | `add-sdk-keys-and-evaluation-api` | Archived | SDK key creation, hashed keys, single/all flag evaluation APIs |
| 6 | `add-dashboard-flag-management` | Delivered (absorbed into other changes) | dashboard project/flag views, environment switching, flag toggling — shipped via `enhance-dashboard-ui-foundation` and `add-boolean-feature-flags` rather than as its own change |
| 7 | `add-audit-logs` | Archived | audit events for important management operations |
| 8 | `add-percentage-rollouts` | Archived | deterministic rollout buckets and rollout configuration |
| 9 | `add-targeting-rules` | Archived | ordered rules, attribute operators, first-match evaluation |
| 10 | `add-segments` | Archived | reusable user segments, segment matching, and segment-source targeting |
| 11 | `add-redis-cache` | Archived | Redis-backed environment evaluation snapshots, fallback, and invalidation |
| 12 | `add-realtime-updates` | Archived | authenticated SSE dashboard configuration notifications built on the cache invalidation boundary |
| 13 | `add-js-sdk` | Archived | `@flagforge/js-sdk` client, safe defaults, local API wrapper |
| 14 | `add-analytics` | Archived | best-effort evaluation events, basic dashboard metrics, privacy-safe analytics |
| 15 | `add-ci-and-docker-polish` | Archived | CI workflow, Docker polish, production-oriented docs |

## MVP Milestones

### MVP 0: Foundation

Goal: a runnable full-stack project shell.

Included:

- pnpm workspace
- NestJS backend
- Vite React frontend
- Postgres via Docker Compose
- baseline build, lint, and test commands

Current state: complete.

### MVP 1: Management Core

Goal: users can authenticate and manage the basic flag hierarchy.

Included:

- auth
- organization
- projects
- environments
- boolean feature flags
- per-environment flag configuration

Exit criteria:

- user can register and login
- user can create a project
- project has default environments
- user can create a boolean flag
- user can enable or disable the flag per environment

### MVP 2: Evaluation Core

Goal: applications can evaluate configured flags.

Included:

- SDK keys
- hashed key storage
- evaluation API
- deterministic boolean evaluation
- basic failure responses

Exit criteria:

- environment SDK key can be created
- API can evaluate one flag by key
- API can evaluate all flags for an environment
- disabled flags return false
- enabled boolean flags return configured value

### MVP 3: Usable Dashboard

Goal: the product is usable through the React dashboard.

Included:

- project list/detail
- environment switching
- flag list/detail
- flag toggle and edit forms
- audit log read model
- targeting rule management for flag environment configurations
- segment list/detail and segment condition management
- segment selection in flag targeting workflows

Exit criteria:

- common README demo flow works from the browser
- API and frontend tests cover the main workflow

## Later Phases

| Phase | Theme | Includes |
| --- | --- | --- |
| v0.2 | Rollouts and audit | deterministic percentage rollouts, audit logs |
| v0.3 | Targeting | attribute rules, operators, ordered rules, reusable segments |
| v0.4 | Performance and realtime | Redis cache, cache invalidation, authenticated SSE dashboard updates |
| v0.5 | SDK and analytics | JavaScript SDK, evaluation events, charts |
| v1.0 | Portfolio polish | CI/CD, Docker polish, OpenAPI docs, screenshots, ADRs |

Current operations step: `polish-production-readiness` covers OpenAPI documentation, dead-code and UI cleanup, and a README restructure following the archived `add-ci-and-docker-polish` change. Likely follow-up work after this is screenshots, ADRs, or team/member collaboration features.

## Change Sizing Rule

One OpenSpec change should fit one of these shapes:

- one vertical slice that can be demoed
- one backend capability plus matching frontend surface
- one infrastructure capability with verification

Avoid combining unrelated systems such as auth, Redis, WebSockets, analytics, and SDK packaging in the same change.

## Definition of Done

A change is done when:

- all OpenSpec tasks are checked
- specs match implemented behavior
- `corepack pnpm build` passes
- `corepack pnpm test` passes
- `corepack pnpm lint` passes
- local README or docs are updated when workflow changes
- the change is archived after review
