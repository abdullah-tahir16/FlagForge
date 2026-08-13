## ADDED Requirements

### Requirement: Dashboard uses a shared application shell

The system SHALL render authenticated dashboard screens inside a shared application shell with persistent navigation, workspace context, user context, and API status.

#### Scenario: Desktop dashboard navigation
- **WHEN** an authenticated user opens a dashboard route on a desktop viewport
- **THEN** the dashboard displays persistent navigation with visible route labels and active route state

#### Scenario: Mobile dashboard navigation
- **WHEN** an authenticated user opens a dashboard route on a mobile viewport
- **THEN** the dashboard provides compact navigation that keeps primary routes reachable without horizontal scrolling

### Requirement: Dashboard uses consistent icons

The system SHALL use one consistent vector icon system for dashboard navigation, repeated actions, statuses, and empty states.

#### Scenario: Navigation icon consistency
- **WHEN** dashboard navigation renders
- **THEN** navigation items use consistent icon sizing, stroke style, accessible labels, and visible text labels

#### Scenario: Action icon consistency
- **WHEN** repeated dashboard actions render
- **THEN** icons use the same icon family and do not rely on emoji or ad-hoc inline SVGs

### Requirement: Dashboard provides reusable UI primitives

The system SHALL provide reusable common UI primitives for dashboard structure and feedback.

#### Scenario: Page-level structure
- **WHEN** a dashboard screen renders
- **THEN** it can use shared page header and toolbar primitives for title, supporting metadata, and primary actions

#### Scenario: State feedback
- **WHEN** dashboard data is loading, empty, invalid, or failed
- **THEN** the UI uses shared skeleton, empty state, alert, or error feedback primitives instead of plain unstyled text

### Requirement: Dashboard uses themed destructive confirmation

The system SHALL use a themed accessible confirmation flow for destructive dashboard actions.

#### Scenario: Delete project confirmation
- **WHEN** a user starts deleting a project
- **THEN** the dashboard shows a themed confirmation dialog with cancel and destructive confirm actions

#### Scenario: Cancel destructive action
- **WHEN** a user cancels the confirmation dialog
- **THEN** the system does not delete the project

### Requirement: Dashboard styling is token-driven

The system SHALL style dashboard UI through semantic theme tokens rather than hardcoded palette utilities.

#### Scenario: Theme source of truth
- **WHEN** a developer changes dashboard theme values in `frontend/src/styles.css`
- **THEN** shell, navigation, common controls, states, and feature screens update consistently through Tailwind semantic tokens

#### Scenario: Hardcoded palette avoidance
- **WHEN** dashboard UI components are reviewed
- **THEN** they do not use raw Tailwind palette classes for app colors unless a documented exception exists

### Requirement: Dashboard UX is responsive and accessible

The system SHALL preserve readable, operable dashboard UX across mobile and desktop viewports.

#### Scenario: Small viewport layout
- **WHEN** the dashboard is viewed at 375px width
- **THEN** controls, forms, navigation, and repeated rows fit without horizontal scrolling or incoherent overlap

#### Scenario: Keyboard focus visibility
- **WHEN** a keyboard user tabs through dashboard controls
- **THEN** interactive elements expose visible focus states and preserve logical focus order

### Requirement: Auth screens follow the dashboard visual system

The system SHALL align login and registration screens with the shared FlagForge visual system.

#### Scenario: Auth screen branding
- **WHEN** a visitor opens login or registration
- **THEN** the screen uses the shared theme tokens, brand hierarchy, accessible form controls, and consistent feedback states

### Requirement: Project and environment screens use operational layouts

The system SHALL present project and environment workflows using dense, scan-friendly dashboard layouts.

#### Scenario: Project list usability
- **WHEN** an authenticated user opens the projects route
- **THEN** projects are presented in a compact management surface with clear primary action, row actions, loading state, empty state, and error state

#### Scenario: Project detail usability
- **WHEN** an authenticated user opens a project detail route
- **THEN** project settings and environments are organized with clear hierarchy, stable row dimensions, and visible save/delete feedback

### Requirement: UI/UX guidance is durable

The system SHALL document strict UI/UX rules for future dashboard work.

#### Scenario: LLM context updated
- **WHEN** future LLM work reads `LLM_CONTEXT.md`
- **THEN** it finds strict dashboard UI/UX rules covering shell, primitives, tokens, icons, states, responsive checks, and prohibited patterns

#### Scenario: Project UI guide exists
- **WHEN** a developer reads project docs
- **THEN** a dedicated dashboard UI/UX guide describes the visual style, token rules, component expectations, and verification checklist
