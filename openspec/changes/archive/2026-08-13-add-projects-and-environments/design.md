## Context

FlagForge now has a pnpm workspace, NestJS backend, React dashboard, PostgreSQL persistence, authentication, and a current organization boundary. The README product model starts with projects and environments before feature flags, SDK keys, evaluation APIs, and rollout rules can be meaningful.

The current authenticated user context includes `organizationId` and `role`. This change should use that context to scope project and environment operations so users only see and mutate resources inside their own organization.

## Goals / Non-Goals

**Goals:**

- Add persisted projects scoped to organizations.
- Add persisted environments scoped to projects.
- Create default environments for each new project.
- Provide protected management APIs for project CRUD and environment list/update workflows.
- Provide dashboard routes and UI for project listing, project creation, project detail, and environment management.
- Keep frontend structure aligned with `LLM_CONTEXT.md`: core types, pure API files, one hook per TanStack Query operation, use-case orchestration, render-only containers, presentation hooks, and common tokenized UI.
- Keep local seed data useful by adding a demo project and default environments for the demo owner.

**Non-Goals:**

- Feature flag creation or flag configuration.
- SDK keys or evaluation APIs.
- Advanced environment deletion/reordering rules beyond basic management.
- Multi-organization switching.
- Project-level RBAC beyond using authenticated organization ownership/developer access patterns already available.

## Decisions

### Model projects as organization-owned resources

Projects will have `id`, `organizationId`, `name`, stable `key`, optional `description`, and timestamps. Project keys will be unique per organization.

Rationale: projects are the top-level flag grouping inside an organization. A per-organization uniqueness constraint allows different organizations to use the same project key without collision.

Alternative considered: global project keys. That is simpler for lookup, but it leaks unnecessary global uniqueness into a multi-tenant domain and makes imports/demo data more fragile.

### Create default environments transactionally with project creation

Creating a project will also create `Development`, `Staging`, and `Production` environments in the same transaction. Environment keys will be `development`, `staging`, and `production`.

Rationale: the README demo and future flag configuration need environments immediately. Transactional creation prevents half-created projects that cannot be used for flags.

Alternative considered: require users to manually add environments after creating a project. That adds friction before the product has any advanced environment customization.

### Keep environments project-scoped and ordered

Environments will have `id`, `projectId`, `name`, stable `key`, `sortOrder`, and timestamps. Environment keys will be unique per project.

Rationale: environment names and display order are part of the management workflow. Stable keys are needed later for SDK keys and evaluation paths.

Alternative considered: hard-code environments without a table. That would work for the first demo but blocks later environment customization and SDK-key scoping.

### Use authenticated organization context for all management queries

Project and environment services will join or filter through the authenticated `organizationId`. A user cannot access a project or environment outside their organization even if they know its id.

Rationale: this preserves the organization boundary introduced by auth and avoids relying on frontend filtering.

Alternative considered: trusting project ids from the client and checking ownership only on project endpoints. That creates hidden cross-tenant risks for nested environment endpoints.

### Keep deletes conservative

Project deletion may remove its environments through cascade behavior. Environment deletion is out of scope for this slice unless needed for basic management; future feature flag references should define stricter deletion rules.

Rationale: no feature flags exist yet, so project cascade is acceptable. Environment deletion semantics become more important once flags and SDK keys depend on environments.

Alternative considered: soft-delete from the start. That adds query complexity before the domain has dependent resources.

### Frontend routes follow product hierarchy

Dashboard routes should expose a project list and project detail route, for example `/projects` and `/projects/:projectId`. Project detail should show environment rows and basic edit controls.

Rationale: URLs should match the core product hierarchy and make the next feature-flag change straightforward.

Alternative considered: keep all project/environment UI on the existing home route. That is quick but becomes cramped immediately when flags are added.

## Risks / Trade-offs

- [Risk] Project and environment endpoints accidentally expose cross-organization records -> Mitigation: every lookup filters through authenticated `organizationId`; tests cover wrong-organization access.
- [Risk] Default environment creation produces duplicates on retries -> Mitigation: perform project and default environment creation inside one transaction with uniqueness constraints.
- [Risk] Environment deletion rules will change once flags and SDK keys exist -> Mitigation: keep environment deletion out of scope or minimal in this slice.
- [Risk] Dashboard scope grows into full flag management -> Mitigation: project detail only manages environments and leaves flag UI for `add-boolean-feature-flags`.
- [Risk] Seed data drifts from demo credentials -> Mitigation: keep `pnpm seed` idempotent and update the same demo organization/project each run.

## Migration Plan

1. Add TypeORM entities and migrations for `projects` and `environments`.
2. Run migrations locally before exercising the new APIs.
3. Update the idempotent seed script to create the demo project and default environments.
4. If rollback is needed before dependent flag tables exist, revert the migration to drop `environments` then `projects`.

## Open Questions

- Should environment creation beyond the three defaults be included in this slice, or should this change only allow editing default environment names?
- Should project deletion be exposed in the first dashboard UI, or should it exist only in the API until confirmation/modals are added?
