## Context

FlagForge now has a runnable frontend/backend foundation but no user identity, session handling, or organization boundary. The README defines organizations, users, roles, JWT management APIs, and current organization APIs as prerequisites for the rest of the management platform.

This change introduces the first secure management context:

```text
User registers
      |
      v
Organization is created
      |
      v
User becomes OWNER
      |
      v
Dashboard receives an access token and refresh cookie
```

Future projects, environments, feature flags, SDK keys, and audit logs will hang from the authenticated user's organization.

## Goals / Non-Goals

**Goals:**

- Add persistent `users`, `organizations`, and `refresh_sessions` tables through TypeORM migrations.
- Support registration that creates an organization and first OWNER user transactionally.
- Support login with email/password credentials.
- Hash passwords with Argon2.
- Issue JWT access tokens for management APIs.
- Issue refresh tokens as httpOnly cookies, store only hashed refresh token values, rotate refresh tokens, and support logout.
- Add `GET /api/v1/auth/me` for session restoration.
- Add JWT guard support for protected management endpoints.
- Add current organization read/update endpoints.
- Add frontend register/login routes, protected routing, session persistence, and current organization display/edit surface.
- Add backend and frontend verification coverage for auth and organization behavior.

**Non-Goals:**

- Team invitations and multi-user organization management.
- Full RBAC permissions beyond assigning the first user as `OWNER`.
- Production email verification or password reset.
- OAuth/social login.
- Advanced account lockout or abuse prevention.
- Project, environment, feature flag, SDK key, audit, or evaluation behavior.

## Decisions

### Register creates organization and OWNER user together

Registration will accept user profile fields plus organization name. The backend creates the organization and user in a single database transaction, assigning the user role `OWNER`.

Rationale: FlagForge is organization-scoped, and all future management resources require an organization context.

Alternative considered: allow user-only registration and create the organization later. That would require handling users without a usable product context.

### Use Argon2 for password hashing

Passwords will be hashed with `argon2` before storage. Password hashes are never returned by API responses.

Rationale: the README prefers Argon2, and password hashing is security-sensitive enough to choose the stronger default now.

Alternative considered: bcrypt. It is acceptable, but Argon2 is the selected baseline.

### Use JWT access tokens and rotating httpOnly refresh cookies

Login and registration will return a short-lived access token in JSON and set a refresh token in an httpOnly cookie. Refresh tokens are stored as hashes in `refresh_sessions` and rotated when `/auth/refresh` succeeds.

Rationale: this gives the dashboard a normal management API session model while avoiding plaintext refresh token storage and reducing refresh token exposure to browser JavaScript.

Alternative considered: return refresh tokens in JSON and store them in local storage. That is simpler for an SPA, but it exposes long-lived credentials to JavaScript and is not the desired baseline.

### Keep frontend refresh handling cookie-based

The frontend will not store refresh tokens in local storage. Axios will send credentials for refresh/logout requests so the browser includes the httpOnly refresh cookie. The access token may be held in memory for management API Authorization headers, and session restoration can call refresh using the cookie after reload.

Rationale: this keeps long-lived credentials out of frontend JavaScript while preserving SPA ergonomics.

Alternative considered: store access and refresh tokens in local storage. That is easier to implement, but it is a weaker default for a management dashboard.

### Configure CORS and cookie attributes intentionally

The backend will support credentialed CORS for the configured frontend origin. Refresh cookies will be httpOnly, SameSite=Lax for local same-site development, secure in production, path-scoped to auth refresh/logout routes where practical, and cleared on logout.

Rationale: cookies require explicit CORS and attribute decisions or auth will fail inconsistently between local and production-like environments.

Alternative considered: defer cookie attributes until deployment. That would make the implementation ambiguous and likely fragile.

### Use React Final Form with Zod for dashboard forms

Authentication forms will use `react-final-form` for field state and submission lifecycle, with Zod schemas for validation.

Rationale: this keeps form state consistent and makes validation rules explicit, reusable, and type-aligned with frontend auth inputs.

Alternative considered: hand-managed React state per form. That worked for the first pass, but it duplicates validation and field behavior as forms expand.

### Use semantic theme tokens for UI styling

Frontend UI colors, radius, and shadows will be mapped through CSS variables and Tailwind semantic tokens.

Rationale: changing a theme value in one place should update the project UI consistently. Common controls should consume semantic tokens instead of hardcoded per-screen colors.

Alternative considered: Tailwind utility colors directly in each component. That is quick, but it makes project-wide theme changes noisy and error-prone.

### Keep role semantics minimal

This change introduces the `OWNER`, `ADMIN`, `DEVELOPER`, and `VIEWER` enum values but only enforces authenticated access and current organization ownership.

Rationale: later RBAC should be designed around real project/flag permissions. Enforcing broad role checks before those resources exist would be premature.

Alternative considered: implement full RBAC now. That would grow this change too much and mix auth with flag-management authorization.

### Use TypeORM migrations, not schema synchronization

The new tables will be created with migrations. `synchronize` remains disabled unless explicitly enabled for local development.

Rationale: auth and organization tables are persistent core data and need controlled schema evolution.

Alternative considered: rely on `synchronize` during development. That is fast, but it conflicts with the README requirement to use migrations.

## Risks / Trade-offs

- [Risk] Cookie refresh flow can fail because of CORS or SameSite mistakes -> Mitigation: configure credentialed CORS and test refresh/logout from the frontend origin.
- [Risk] Access token held in memory is lost on page reload -> Mitigation: restore the session by calling refresh with the httpOnly cookie.
- [Risk] Refresh token rotation can lock users out if cookies are not updated -> Mitigation: set the rotated refresh cookie in the same response that returns the new access token.
- [Risk] Registration may leave partial data if not transactional -> Mitigation: create organization and user in one transaction.
- [Risk] TypeORM migrations drift from entities -> Mitigation: require build/test and migration review in this change.
- [Risk] OWNER-only role behavior may be mistaken for complete RBAC -> Mitigation: document that full RBAC is a later change.
- [Risk] Form wrappers become too generic -> Mitigation: keep common controls small and composable, and keep screen behavior in presentation hooks.

## Migration Plan

Add migrations for:

- `organizations`
- `users`
- `refresh_sessions`

Apply migrations in local development before running auth flows. Rollback should drop refresh sessions, users, and organizations in reverse dependency order.

## Open Questions

- None.
