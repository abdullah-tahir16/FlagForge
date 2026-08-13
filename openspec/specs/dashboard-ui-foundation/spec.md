# dashboard-ui-foundation Specification

## Purpose

Define the shared dashboard shell, visual system, UI primitives, accessibility expectations, and responsive behavior required for FlagForge management screens.

## Requirements

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

### Requirement: Dashboard supports feature flag management

The system SHALL provide dashboard routes and token-driven UI for managing boolean feature flags, per-environment rollout configuration, and targeting rules.

#### Scenario: Flags navigation is available
- **WHEN** an authenticated user views the dashboard shell after feature flag management is implemented
- **THEN** the Flags navigation item is enabled, uses a consistent icon and label, and has visible active state on flag routes

#### Scenario: Project detail links to project flags
- **WHEN** an authenticated user opens a project detail route
- **THEN** the dashboard provides a clear action to manage that project's feature flags

#### Scenario: Project flag list screen
- **WHEN** an authenticated user opens a project flag list route
- **THEN** the dashboard displays project feature flags in a dense management surface with create, open, and delete actions

#### Scenario: Feature flag detail screen
- **WHEN** an authenticated user opens a feature flag detail route
- **THEN** the dashboard displays feature flag metadata, per-environment boolean configuration rows, and targeting rule management for each environment configuration

#### Scenario: Environment rollout control
- **WHEN** an authenticated user edits a feature flag environment configuration
- **THEN** the dashboard provides a compact rollout percentage control validated from 0 through 100 alongside enabled state and served boolean value

#### Scenario: Targeting rule manager
- **WHEN** an authenticated user manages rules for a feature flag environment configuration
- **THEN** the dashboard provides dense ordered rule rows with create, edit, delete, and reorder actions using shared common controls

#### Scenario: Targeting rule form validation
- **WHEN** an authenticated user creates or edits a targeting rule
- **THEN** the dashboard uses React Final Form and Zod validation for attribute, operator, comparison value, and boolean result fields

#### Scenario: Feature flag empty state
- **WHEN** a project has no feature flags
- **THEN** the dashboard shows a themed empty state with a create-feature-flag action

#### Scenario: Feature flag destructive confirmation
- **WHEN** a user starts deleting a feature flag or targeting rule
- **THEN** the dashboard shows a themed confirmation dialog with cancel and destructive confirm actions

#### Scenario: Feature flag responsive layout
- **WHEN** flag management screens are viewed at 375px, 1024px, and 1440px
- **THEN** navigation, forms, rows, toggles, rollout controls, targeting rule controls, badges, and actions fit without horizontal scrolling or incoherent overlap

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

### Requirement: Dashboard supports audit log viewing

The system SHALL provide a token-driven dashboard route for viewing organization audit logs.

#### Scenario: Audit navigation is available
- **WHEN** an authenticated user views the dashboard shell after audit logs are implemented
- **THEN** the Audit navigation item is enabled, uses a consistent icon and label, and has visible active state on audit routes

#### Scenario: Audit log screen
- **WHEN** an authenticated user opens the audit route
- **THEN** the dashboard displays audit entries in a dense management surface with action, resource, actor, context, and timestamp

#### Scenario: Audit empty state
- **WHEN** no audit entries exist for the selected filters
- **THEN** the dashboard shows a themed empty state

#### Scenario: Audit loading and error states
- **WHEN** audit entries are loading or fail to load
- **THEN** the dashboard uses shared skeleton and alert feedback primitives

#### Scenario: Audit filters
- **WHEN** an authenticated user filters audit logs
- **THEN** the dashboard updates the audit list using token-driven controls without page-local navigation

#### Scenario: Audit responsive layout
- **WHEN** audit screens are viewed at 375px, 1024px, and 1440px
- **THEN** filters, rows, badges, timestamps, and resource metadata fit without horizontal scrolling or incoherent overlap
