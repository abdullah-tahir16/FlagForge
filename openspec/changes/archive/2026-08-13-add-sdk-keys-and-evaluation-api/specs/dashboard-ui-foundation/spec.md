## ADDED Requirements

### Requirement: Dashboard supports SDK key management

The system SHALL provide token-driven dashboard UI for managing environment SDK keys.

#### Scenario: Environment row exposes SDK key action
- **WHEN** an authenticated user views project environments
- **THEN** the dashboard provides a clear action to manage SDK keys for each environment

#### Scenario: SDK key list screen or panel
- **WHEN** an authenticated user opens SDK key management for an environment
- **THEN** the dashboard displays SDK keys in a dense management surface with create and revoke actions

#### Scenario: SDK key create form
- **WHEN** an authenticated user creates an SDK key
- **THEN** the dashboard uses React Final Form and Zod validation through common form controls

#### Scenario: One-time SDK key display
- **WHEN** SDK key creation succeeds
- **THEN** the dashboard displays the full key secret once with a copy action and clear persistence-safe metadata

#### Scenario: SDK key revoke confirmation
- **WHEN** a user starts revoking an SDK key
- **THEN** the dashboard shows a themed confirmation dialog with cancel and destructive confirm actions

#### Scenario: SDK key responsive layout
- **WHEN** SDK key management is viewed at 375px, 1024px, and 1440px
- **THEN** forms, rows, copy controls, badges, and actions fit without horizontal scrolling or incoherent overlap
