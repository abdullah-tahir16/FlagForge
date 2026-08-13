## ADDED Requirements

### Requirement: Repository includes SDK workspace packages

The system SHALL include distributable SDK packages in the pnpm workspace without changing the `frontend/` and `backend/` application folder boundaries.

#### Scenario: JavaScript SDK workspace package is discoverable
- **WHEN** a developer installs dependencies from the repository root using pnpm
- **THEN** pnpm recognizes the JavaScript SDK package as a workspace package

#### Scenario: Root verification includes SDK package
- **WHEN** a developer runs root build, lint, or test scripts
- **THEN** the scripts execute the corresponding JavaScript SDK package commands along with the existing frontend and backend checks
