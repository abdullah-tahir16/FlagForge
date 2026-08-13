## Context

The dashboard now supports authentication, organization profile editing, project CRUD, and environment editing. The screens are functional but not yet a strong product UI: the shell uses a simple top navigation, project management is form-heavy, destructive actions use browser confirmation, loading states are plain text, and UI rules live mostly in conversation/context rather than durable project docs.

The next product slice is feature flags. If that work starts before the dashboard shell and common UI primitives are improved, the feature-flag screens will likely inherit inconsistent layout, spacing, actions, and state handling. This change establishes a strict UI/UX foundation first.

## Goals / Non-Goals

**Goals:**

- Make authenticated dashboard screens feel like a polished SaaS operations tool.
- Add a responsive app shell with sidebar navigation on desktop and compact navigation on mobile.
- Add a consistent icon system using `lucide-react`.
- Add reusable common UI primitives for headers, toolbars, badges, alerts, empty states, skeleton loading, confirm dialogs, and dense list/table-like rows.
- Improve auth, overview, project list, project detail, and environment editing UX using the new primitives.
- Replace browser-native confirmation with a themed accessible confirmation flow.
- Expand semantic theme tokens for layout, shell, overlays, rows, destructive actions, focus, motion, and elevation.
- Update `LLM_CONTEXT.md` and docs so future LLM work follows strict UI/UX rules.
- Add a dedicated dashboard UI/UX guide under `docs/`.

**Non-Goals:**

- New backend features or database schema changes.
- Feature flag creation, SDK keys, evaluations, audit logs, analytics, or WebSockets.
- Full dark mode unless it can be done token-first without disrupting the current light theme.
- New design system packages beyond a small icon dependency.
- Marketing landing pages.

## Decisions

### Use an application shell instead of page-local navigation

Authenticated screens will use a shared app shell with desktop sidebar, top bar, workspace/user/API status, and active navigation. Mobile should collapse navigation into a compact top surface or drawer-style menu without hiding the primary routes.

Rationale: FlagForge is an operational dashboard. A persistent navigation frame improves orientation and avoids rebuilding navigation per screen.

Alternative considered: keep top tabs only. That is simpler but does not scale to flags, SDK keys, audit logs, segments, and analytics.

### Use lucide-react for icons

Add `lucide-react` and use it consistently for navigation, actions, statuses, empty states, and destructive confirmations.

Rationale: icons improve scan speed for repeated dashboard workflows and align with project UI rules that prefer recognizable symbols over text-heavy controls.

Alternative considered: inline SVGs. That avoids a dependency but creates inconsistent stroke, sizing, and accessibility patterns.

### Keep the visual style data-dense and operational

The dashboard should be quiet, structured, and scan-friendly: constrained content widths, clear toolbar/actions, compact repeated rows, visible status indicators, and restrained elevation. Avoid marketing-style heroes, decorative illustrations, nested cards, oversized copy, and one-note palettes.

Rationale: users will repeatedly manage projects, flags, environments, and audits. Density and predictable controls matter more than promotional composition.

Alternative considered: bento/marketing layout. It may look more expressive, but it weakens daily operational usability.

### Add strict reusable primitives before more feature screens

Build small common primitives under `presentation/components/Common` and use them immediately in auth/project screens:

- `PageHeader`
- `Toolbar`
- `Badge`
- `Alert`
- `EmptyState`
- `Skeleton`
- `ConfirmDialog`
- `DataList` or table-like row primitive

Rationale: future feature-flag work needs stable primitives. This keeps later slices faster and more consistent.

Alternative considered: style each feature screen directly. That repeats layout/state logic and makes future theme changes noisy.

### Use token-first theming

All new visual decisions must flow through CSS variables and Tailwind semantic `app-*` tokens. Expand tokens as needed for sidebar, top bar, row hover, overlay/scrim, destructive muted backgrounds, focus rings, and elevation.

Rationale: the user explicitly wants universal theme control, and `LLM_CONTEXT.md` already documents token-driven UI as a project rule.

Alternative considered: direct Tailwind palette utilities. That is faster in a single screen but undermines project-wide theme control.

### Use modal confirmation for destructive actions

Project deletion should use an accessible themed confirmation dialog with cancel/confirm buttons and explicit destructive styling.

Rationale: browser `confirm()` is visually inconsistent, blocks richer interaction, and does not align with the dashboard design system.

Alternative considered: delete immediately. That is too risky for resources that will soon own flags/environments.

### Document strict UI/UX rules as implementation output

This change must update durable guidance:

- `LLM_CONTEXT.md`
- `docs/DASHBOARD_UI_UX.md`
- `docs/ROADMAP.md`
- `README.md` if local/demo workflow changes
- `frontend/src/presentation/theme/README.md`

Rationale: the UI foundation should guide future agent and human work, not just change current components.

Alternative considered: rely on OpenSpec only. OpenSpec is change-scoped; `LLM_CONTEXT.md` and docs are the persistent rules future work will actually read.

## Risks / Trade-offs

- [Risk] UI polish expands beyond a foundation change -> Mitigation: limit scope to shell, primitives, auth/project screens, and docs.
- [Risk] Adding many common components creates abstractions too early -> Mitigation: keep primitives small, concrete, and used immediately.
- [Risk] Sidebar navigation may be awkward on mobile -> Mitigation: design mobile-first and verify at 375px width.
- [Risk] Visual density harms readability -> Mitigation: preserve 16px body text, clear grouping, strong contrast, and accessible touch targets.
- [Risk] Icons reduce clarity if used alone -> Mitigation: navigation icons include labels; icon-only controls require accessible labels and tooltips when appropriate.
- [Risk] Theme expansion becomes inconsistent -> Mitigation: document every new token and scan for hardcoded palette classes before completion.

## Migration Plan

1. Add icon dependency and common UI primitives.
2. Expand theme tokens and documentation.
3. Replace app shell and navigation.
4. Refactor auth, overview, project list, project detail, and environment edit screens to consume the primitives.
5. Replace browser confirmation with `ConfirmDialog`.
6. Update `LLM_CONTEXT.md`, roadmap, README/theme docs, and add dashboard UI/UX documentation.
7. Run frontend/root verification and perform responsive visual checks where practical.

## Open Questions

- Should this change add full dark mode now, or only add token structure that makes dark mode straightforward later?
- Should project creation move to a modal, drawer, or remain as a compact side panel for this slice?
