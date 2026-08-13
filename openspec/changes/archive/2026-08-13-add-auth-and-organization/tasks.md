## 1. Backend Dependencies and Configuration

- [x] 1.1 Add backend dependencies for JWT authentication, Passport strategy support, Argon2 password hashing, cookie parsing, and cookie serialization.
- [x] 1.2 Add auth-related environment variables to backend and root examples, including JWT secret, access token TTL, refresh token secret, refresh token TTL, cookie name, cookie secure flag, and cookie same-site mode.
- [x] 1.3 Add TypeORM migration scripts to backend package commands.
- [x] 1.4 Add a backend helper for generating stable URL-safe organization keys from organization names.

## 2. Database Model

- [x] 2.1 Create `Organization` entity with id, name, key, timestamps, and uniqueness constraints.
- [x] 2.2 Create `User` entity with id, email, password hash, first name, last name, organization id, role, and timestamps.
- [x] 2.3 Create `RefreshSession` entity with id, user id, token hash, token prefix or identifier, expiration, revoked timestamp, and timestamps.
- [x] 2.4 Add TypeORM migrations for organizations, users, and refresh sessions.
- [x] 2.5 Ensure migrations do not rely on production schema synchronization.

## 3. Backend Authentication

- [x] 3.1 Add auth DTOs for register, login, refresh, logout, and auth responses that never include refresh token values.
- [x] 3.2 Implement password hashing and password verification with Argon2.
- [x] 3.3 Implement registration command/use case that creates organization and OWNER user transactionally.
- [x] 3.4 Implement login command/use case that validates credentials, returns an access token, and sets the refresh token as an httpOnly cookie.
- [x] 3.5 Implement refresh command/use case that reads the refresh cookie, rotates refresh tokens, sets a new httpOnly cookie, and rejects reused or revoked tokens.
- [x] 3.6 Implement logout command/use case that revokes the active refresh session and clears the refresh cookie.
- [x] 3.7 Implement JWT strategy, authenticated request user type, and auth guard for protected management APIs.
- [x] 3.8 Add auth controller endpoints for `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`, and `GET /auth/me`.
- [x] 3.9 Ensure user/auth responses never include password hashes, refresh token hashes, or refresh token plaintext values.
- [x] 3.10 Configure credentialed CORS and refresh cookie attributes for local development and production defaults.

## 4. Backend Organization

- [x] 4.1 Implement current organization query for authenticated users.
- [x] 4.2 Implement current organization update for OWNER users.
- [x] 4.3 Add organization controller endpoints for `GET /organizations/current` and `PATCH /organizations/current`.
- [x] 4.4 Ensure organization responses exclude organization member lists in this change.

## 5. Backend Tests

- [x] 5.1 Add unit tests for password hashing and credential validation behavior.
- [x] 5.2 Add tests for successful registration creating organization and OWNER user.
- [x] 5.3 Add tests for duplicate email registration rejection.
- [x] 5.4 Add tests for successful and invalid login behavior, including httpOnly refresh cookie creation.
- [x] 5.5 Add tests for current user lookup with and without authentication.
- [x] 5.6 Add tests for refresh token rotation through cookies and revoked token rejection.
- [x] 5.7 Add tests for logout revoking refresh sessions and clearing the refresh cookie.
- [x] 5.8 Add tests for current organization lookup and owner update behavior.

## 6. Frontend Authentication

- [x] 6.1 Add frontend core auth and organization types with re-exports.
- [x] 6.2 Add pure API calls for register, login, refresh, logout, current user, and current organization.
- [x] 6.3 Add in-memory access token session utility that never stores refresh token values in local storage.
- [x] 6.4 Add Axios request interceptor that attaches the access token to management API requests and enables credentials for refresh/logout calls.
- [x] 6.5 Add TanStack Query hooks and mutations for auth and current organization operations.
- [x] 6.6 Add auth use case for login, registration, logout, and session restoration orchestration.
- [x] 6.7 Add presentation hooks for auth form state and protected session state.
- [x] 6.8 Add login and registration route containers.
- [x] 6.9 Add protected dashboard route behavior that redirects unauthenticated visitors to login.
- [x] 6.10 Add current organization display and basic owner-edit surface.

## 7. Frontend Verification

- [x] 7.1 Verify unauthenticated visitors can reach login and registration routes.
- [x] 7.2 Verify protected routes redirect when no session exists.
- [x] 7.3 Verify auth API typecheck coverage through frontend build or static checks.
- [x] 7.4 Verify session restoration uses the refresh cookie to obtain a new access token after page reload.

## 8. Documentation and Progress

- [x] 8.1 Update README local API section with auth and organization endpoints.
- [x] 8.2 Update roadmap status to mark `add-auth-and-organization` as active or complete as appropriate.
- [x] 8.3 Document that refresh tokens use httpOnly cookies and are not exposed to frontend JavaScript.

## 9. Final Verification

- [x] 9.1 Run database migrations against local PostgreSQL.
- [x] 9.2 Run backend tests.
- [x] 9.3 Run frontend build or static checks.
- [x] 9.4 Run root workspace build, test, and lint commands.
- [x] 9.5 Run OpenSpec status/apply checks for `add-auth-and-organization`.

## 10. Form and Theme Refinement

- [x] 10.1 Add `react-final-form`, `final-form`, and `zod` to the frontend.
- [x] 10.2 Refactor login and registration forms to use React Final Form.
- [x] 10.3 Add Zod schemas for login and registration validation.
- [x] 10.4 Add reusable common form controls under `presentation/components/Common`.
- [x] 10.5 Add semantic theme tokens for colors, radius, and shadows.
- [x] 10.6 Refactor auth and dashboard UI to use common components and theme tokens.
- [x] 10.7 Verify root build, test, and lint after the refinement.
- [x] 10.8 Apply the FlagForge default theme palette across semantic tokens and core dashboard surfaces.
- [x] 10.9 Add idempotent local demo seed data and refresh the auth screen visual design.
