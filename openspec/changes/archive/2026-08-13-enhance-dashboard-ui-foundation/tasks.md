## 1. UI Documentation and Context

- [x] 1.1 Update `LLM_CONTEXT.md` with strict dashboard UI/UX rules for shell structure, navigation, primitives, icons, token usage, states, responsive checks, and prohibited patterns.
- [x] 1.2 Add `docs/DASHBOARD_UI_UX.md` as the durable dashboard UI/UX guide for product style, layout rules, component expectations, state handling, accessibility, and verification.
- [x] 1.3 Update `frontend/src/presentation/theme/README.md` with expanded semantic token guidance for dashboard shell, overlay, row, destructive, focus, and motion/elevation tokens.
- [x] 1.4 Update `docs/ROADMAP.md` to mark archived changes correctly and list `enhance-dashboard-ui-foundation` as the active UI foundation step before feature flags.
- [x] 1.5 Update `README.md` if local dashboard workflow or demo instructions change during the UI enhancement.

## 2. Dependencies and Theme Foundation

- [x] 2.1 Add `lucide-react` to the frontend package.
- [x] 2.2 Expand CSS variables in `frontend/src/styles.css` for sidebar, top bar, row hover, overlay/scrim, destructive surfaces, focus, motion, and elevation.
- [x] 2.3 Map new semantic tokens in `frontend/tailwind.config.ts`.
- [x] 2.4 Scan frontend presentation code for raw palette utilities and replace app UI colors with semantic `app-*` tokens.
- [x] 2.5 Add reduced-motion friendly transition defaults where shared primitives animate.

## 3. Common UI Primitives

- [x] 3.1 Add shared `PageHeader` component for screen title, description, metadata, and primary actions.
- [x] 3.2 Add shared `Toolbar` component for filters, search slots, and action grouping.
- [x] 3.3 Add shared `Badge` component for statuses, roles, keys, and small metadata.
- [x] 3.4 Add shared `Alert` component for error, warning, success, and info feedback.
- [x] 3.5 Add shared `EmptyState` component with icon, message, and optional action.
- [x] 3.6 Add shared `Skeleton` component for loading pages, panels, and dense rows.
- [x] 3.7 Add shared `ConfirmDialog` component for destructive confirmation with accessible labels and cancel/confirm actions.
- [x] 3.8 Add shared dense list or table-like row primitive for project and future flag management surfaces.

## 4. Dashboard Shell and Navigation

- [x] 4.1 Refactor `AppShell` into a responsive dashboard shell with desktop sidebar, top bar, workspace context, user context, API status, and logout action.
- [x] 4.2 Add icon+label navigation items for Overview, Projects, Flags, Environments, and Audit, with disabled/unavailable states where routes are not implemented.
- [x] 4.3 Ensure active route state is visible and not conveyed by color alone.
- [x] 4.4 Add mobile navigation behavior that keeps primary routes reachable at 375px without horizontal scrolling.
- [x] 4.5 Ensure shell spacing and content width are stable across overview, projects, and project detail routes.

## 5. Auth UX Polish

- [x] 5.1 Refine login and registration screens to align with the dashboard visual system and expanded theme tokens.
- [x] 5.2 Improve auth form spacing, focus states, loading states, and error recovery while keeping React Final Form and Zod validation.
- [x] 5.3 Replace visible demo credential treatment with a polished local-development hint that does not dominate the primary auth flow.
- [x] 5.4 Verify auth screens fit mobile and desktop viewports without overlap.

## 6. Project and Environment UX Polish

- [x] 6.1 Refactor `/projects` to use `PageHeader`, `Toolbar`, dense rows/table-like project list, `EmptyState`, `Skeleton`, and `Alert`.
- [x] 6.2 Refactor project creation into the selected polished surface: compact side panel, modal, or drawer.
- [x] 6.3 Replace browser `confirm()` project deletion with `ConfirmDialog`.
- [x] 6.4 Refactor `/projects/:projectId` to use `PageHeader`, metadata badges, structured settings sections, and improved hierarchy.
- [x] 6.5 Refactor environment editing into compact stable rows with clear save/loading/error feedback.
- [x] 6.6 Ensure project and environment delete/edit/save actions have clear disabled, hover, active, focus, loading, and error states.
- [x] 6.7 Ensure empty, loading, and error states are visible, responsive, and consistent across project screens.

## 7. Accessibility and Responsive Verification

- [x] 7.1 Verify dashboard navigation and dialogs are keyboard reachable with visible focus states.
- [x] 7.2 Verify confirmation dialog cancel/confirm behavior and accessible labeling.
- [x] 7.3 Verify mobile viewport at 375px for auth, overview, projects, and project detail screens.
- [x] 7.4 Verify desktop viewport at 1024px and 1440px for shell layout, project list density, and content hierarchy.
- [x] 7.5 Verify text does not overflow buttons, badges, rows, or panels.

## 8. Final Verification

- [x] 8.1 Run frontend build or static checks after UI changes.
- [x] 8.2 Run root workspace build, test, and lint commands.
- [x] 8.3 Run OpenSpec status/apply checks for `enhance-dashboard-ui-foundation`.
- [x] 8.4 Run OpenSpec validation for `enhance-dashboard-ui-foundation`.
