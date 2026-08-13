## Why

FlagForge needs authenticated management access before users can safely manage projects, environments, and feature flags. Organization ownership is the first domain boundary because all later management resources belong to an organization.

## What Changes

- Add user registration for creating the first user and organization together.
- Add login with email/password credentials.
- Add JWT access tokens for dashboard management APIs.
- Add refresh tokens delivered as httpOnly cookies with hashed storage, rotation, and logout support.
- Add a current-user endpoint for restoring dashboard sessions.
- Add organization ownership and basic role support with `OWNER` as the initial role.
- Add current-organization read/update APIs.
- Add backend persistence entities and migrations for users, organizations, and refresh sessions.
- Add frontend authentication screens, session state, protected routing, and current organization display/edit surface.
- Add tests for registration, login, current user lookup, logout, token refresh, and organization ownership behavior.

## Capabilities

### New Capabilities

- `user-authentication`: Covers registration, login, token issuance, refresh, logout, current-user lookup, password hashing, and protected API access.
- `organization-membership`: Covers organization creation during registration, current organization management, user ownership, and baseline organization role semantics.

### Modified Capabilities

- None.

## Impact

- Affects backend `auth`, `users`, `organizations`, and `common` modules.
- Adds database entities, migrations, DTOs, guards, strategies, and tests.
- Adds frontend auth routes, forms, API calls, TanStack Query hooks, use cases, protected route behavior, and session persistence.
- Introduces security-sensitive dependencies for password hashing and JWT handling.
- Establishes the identity and organization context required by later project, environment, flag, audit, and RBAC changes.
