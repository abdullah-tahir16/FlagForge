## ADDED Requirements

### Requirement: Backend exposes interactive OpenAPI documentation

The system SHALL serve interactive OpenAPI (Swagger) documentation generated from controller and DTO metadata.

#### Scenario: Documentation endpoint is reachable
- **WHEN** the backend is running
- **THEN** `/api/docs` serves an interactive Swagger UI backed by a generated OpenAPI document

#### Scenario: Documented routes match implemented routes
- **WHEN** the OpenAPI document is generated
- **THEN** every listed route, path parameter, and HTTP method matches an actual controller route, with no invented or aspirational endpoints

### Requirement: OpenAPI documentation covers all management and evaluation controllers

The system SHALL annotate every management and evaluation controller so it appears in the generated documentation with accurate request and response schemas.

#### Scenario: Controller appears under a tagged section
- **WHEN** the OpenAPI document is generated
- **THEN** every controller (auth, organizations, projects, environments, feature flags, targeting rules, segments, sdk keys, audit, realtime, analytics, evaluations) appears under a distinct tagged section

#### Scenario: Request schemas match real DTOs
- **WHEN** a documented operation specifies a request body
- **THEN** the schema matches the actual request DTO class used by that controller method, including required fields and types

#### Scenario: Response bodies are documented by status and description
- **WHEN** a documented operation specifies a response
- **THEN** it includes an accurate status code and a human-written description of the returned data; a structured JSON schema for the response body is not required, since response DTOs are plain interfaces rather than classes in this codebase and converting them is out of scope for this change

### Requirement: OpenAPI documentation reflects the actual authentication scheme

The system SHALL document the bearer-token authentication scheme used by protected routes rather than an authentication method the API does not implement.

#### Scenario: Protected routes are marked as requiring authentication
- **WHEN** the OpenAPI document is generated for a route behind the authentication guard
- **THEN** the route is marked as requiring the documented security scheme

#### Scenario: Documented scheme matches real authentication
- **WHEN** the documented security scheme is inspected
- **THEN** it describes an HTTP bearer token scheme matching the access token returned by `/auth/login` and `/auth/register`, not a cookie-based or API-key scheme the backend does not use for route protection
