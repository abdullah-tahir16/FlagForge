## ADDED Requirements

### Requirement: User can register

The system SHALL allow a new user to register with email, password, first name, last name, and organization name.

#### Scenario: Successful registration

- **WHEN** a visitor submits valid registration details with an unused email
- **THEN** the system creates a user, creates an organization, assigns the user as OWNER, and returns an authenticated session

#### Scenario: Duplicate email registration

- **WHEN** a visitor submits registration details using an email already assigned to a user
- **THEN** the system rejects the request with a validation error and does not create another user or organization

### Requirement: User passwords are securely stored

The system SHALL hash user passwords before storage and MUST never expose password hashes through API responses.

#### Scenario: Password stored after registration

- **WHEN** a user registers with a password
- **THEN** the database stores only an Argon2 password hash for that user

#### Scenario: User response excludes password hash

- **WHEN** an authenticated user fetches their profile
- **THEN** the response does not include password hash or password fields

### Requirement: User can login

The system SHALL allow registered users to login with email and password credentials.

#### Scenario: Successful login

- **WHEN** a registered user submits a correct email and password
- **THEN** the system returns an access token and current user summary, and sets the refresh token as an httpOnly cookie

#### Scenario: Invalid login

- **WHEN** a user submits an unknown email or incorrect password
- **THEN** the system rejects the request without revealing which credential was invalid

### Requirement: Access tokens protect management APIs

The system SHALL require a valid access token for protected management API endpoints.

#### Scenario: Authenticated request

- **WHEN** a request includes a valid access token
- **THEN** the system allows access to protected endpoints for the authenticated user

#### Scenario: Missing token

- **WHEN** a request omits an access token for a protected endpoint
- **THEN** the system rejects the request as unauthorized

#### Scenario: Invalid token

- **WHEN** a request includes an invalid or expired access token
- **THEN** the system rejects the request as unauthorized

### Requirement: User can restore current session

The system SHALL provide a current-user endpoint for authenticated dashboard session restoration.

#### Scenario: Current user lookup

- **WHEN** an authenticated dashboard calls the current-user endpoint
- **THEN** the system returns the user's id, email, first name, last name, role, and organization id

### Requirement: User can refresh session

The system SHALL support refresh token rotation using refresh tokens stored only as hashes and transported to the browser only as httpOnly cookies.

#### Scenario: Successful refresh

- **WHEN** a user's browser sends a valid refresh token cookie to the refresh endpoint
- **THEN** the system revokes or replaces the previous refresh token, returns a new access token, and sets a rotated httpOnly refresh cookie

#### Scenario: Reused refresh token

- **WHEN** a user's browser sends a revoked or previously rotated refresh token cookie
- **THEN** the system rejects the refresh request as unauthorized

### Requirement: User can logout

The system SHALL allow an authenticated user to logout by revoking the active refresh session.

#### Scenario: Successful logout

- **WHEN** a logged-in user requests logout
- **THEN** the system revokes the user's active refresh session and clears the refresh cookie

#### Scenario: Refresh after logout

- **WHEN** a logged-out user attempts to refresh with a revoked or cleared refresh cookie
- **THEN** the system rejects the refresh request as unauthorized

### Requirement: Refresh token is not exposed to frontend JavaScript

The system SHALL NOT return refresh tokens in JSON API responses or require frontend JavaScript to read refresh token values.

#### Scenario: Login refresh token transport

- **WHEN** login succeeds
- **THEN** the response body excludes the refresh token value and the browser receives it only as an httpOnly cookie

#### Scenario: Refresh response token transport

- **WHEN** refresh succeeds
- **THEN** the response body excludes the refresh token value and the browser receives the rotated refresh token only as an httpOnly cookie

### Requirement: Dashboard supports authentication flow

The system SHALL provide frontend routes and state for registration, login, logout, session restoration, and protected dashboard access.

#### Scenario: Visitor sees auth routes

- **WHEN** a visitor opens the dashboard without a session
- **THEN** the visitor can navigate to login and registration screens

#### Scenario: Authenticated user sees protected dashboard

- **WHEN** a user has a valid session
- **THEN** the dashboard allows access to protected application screens

#### Scenario: Visitor cannot access protected dashboard

- **WHEN** a visitor without a valid session opens a protected dashboard route
- **THEN** the dashboard redirects the visitor to login

### Requirement: Dashboard auth forms validate input

The system SHALL validate dashboard authentication forms before submitting requests to the backend.

#### Scenario: Invalid login form

- **WHEN** a visitor submits login with an invalid email or missing password
- **THEN** the dashboard displays field-level validation errors and does not submit the invalid request

#### Scenario: Invalid registration form

- **WHEN** a visitor submits registration with invalid email, short password, or missing required profile fields
- **THEN** the dashboard displays field-level validation errors and does not submit the invalid request
