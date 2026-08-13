# Dashboard UI/UX Guide

FlagForge dashboard screens are operational tools. They should feel clear, compact, and trustworthy for repeated use.

## Product Style

- Use a quiet SaaS dashboard style: structured layout, strong hierarchy, compact rows, restrained shadows, and predictable controls.
- Avoid marketing composition inside authenticated screens. The first viewport should be the working dashboard, not a landing page.
- Keep content density high enough for scanning projects, environments, flags, keys, and audit events without feeling cramped.
- Use cards only for individual repeated items, modals, and genuinely framed tools. Do not place cards inside cards.

## Theme

- Change colors from `frontend/src/styles.css` first. Tailwind app tokens in `frontend/tailwind.config.ts` should expose those variables as semantic `app-*` utilities.
- Use semantic tokens in app UI. Avoid raw palette utilities such as `slate-*`, `blue-*`, `red-*`, `emerald-*`, `gray-*`, `zinc-*`, or `neutral-*`.
- Required dashboard tokens include primary, accent, background, surface, surface-muted, border, text, text-muted, sidebar, topbar, row-hover, overlay, destructive, success, warning, danger, focus, motion, and elevation.
- Destructive actions must use destructive or danger tokens consistently.

## Shell and Navigation

- Authenticated routes use one shared shell with desktop sidebar, top bar, workspace context, API status, user context, and logout.
- Navigation includes icon plus label for Overview, Projects, Flags, Environments, and Audit.
- Unavailable routes should be disabled and visibly separate from active links.
- Active route state needs more than color, such as a rail, border, background, or shape change.
- Mobile navigation must fit at 375px without horizontal scroll.

## Components

- Use `lucide-react` for structural icons. Avoid emoji and one-off inline SVG for common dashboard actions.
- Common dashboard primitives belong under `frontend/src/presentation/components/Common`.
- Use `PageHeader` for title, description, metadata, and primary actions.
- Use `Toolbar` for filters, search, compact context, and grouped actions.
- Use `Badge` for small metadata, status, role, and key labels.
- Use `Alert` for error, warning, success, and info feedback.
- Use `EmptyState` when data is missing and an action is available.
- Use `Skeleton` for predictable loading areas.
- Use `ConfirmDialog` for destructive workflows. Do not use browser confirm.
- Use dense list/table rows for resource management surfaces.

## Forms and Feedback

- Forms use React Final Form and Zod validation.
- Put reusable wrappers and controls under `Common`.
- Inputs, buttons, dialogs, and rows must have clear hover, active, focus, disabled, loading, and error states.
- Keep submit buttons stable in width and height when labels change from idle to loading.
- Error recovery should be visible close to the failed action.

## Accessibility and Responsive Checks

- Keyboard users must be able to reach navigation, dialogs, cancel actions, confirm actions, and form controls.
- Focus rings must be visible and token-driven.
- Dialogs must include accessible labels and should close through cancel actions.
- Verify 375px mobile for auth, overview, projects, and project detail screens.
- Verify 1024px and 1440px desktop for shell layout, project list density, and detail hierarchy.
- Check that text does not overflow buttons, badges, rows, panels, or dialogs.
