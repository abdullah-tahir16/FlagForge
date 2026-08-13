## Why

FlagForge now has enough management surface for users to experience the dashboard, but the current UI still reads like a scaffold: top navigation only, generic panels, plain loading text, browser confirmations, and form-heavy screens. Before adding feature flags, the project needs a stricter dashboard UI/UX foundation so future screens inherit polished, consistent patterns instead of duplicating rough ones.

## What Changes

- Add a strict dashboard UI/UX foundation for authenticated app screens.
- Replace the basic top-nav-only shell with an application shell that supports sidebar navigation, responsive mobile navigation, top-bar workspace context, and active route state.
- Add a consistent icon system using `lucide-react`.
- Add common UI primitives for page headers, toolbars, badges, alerts, empty states, skeletons, confirm dialogs, and dense list/table-like data surfaces.
- Improve project and environment dashboard UX with better hierarchy, clearer actions, compact data density, themed destructive confirmation, loading skeletons, empty states, and error recovery.
- Polish authentication screens so they share the same stricter brand, spacing, typography, and token system.
- Update `LLM_CONTEXT.md` with strict UI/UX rules that future LLM work must follow.
- Add or update project documentation for dashboard UX standards, design-system tokens, and verification expectations.
- Update roadmap/docs to show this UI foundation as the active polish step before feature flags.
- Keep backend behavior changes out of scope except where frontend UX needs no new API.

## Capabilities

### New Capabilities

- `dashboard-ui-foundation`: Shared dashboard shell, reusable UI primitives, strict UI/UX standards, and documentation requirements for future dashboard work.

### Modified Capabilities

- None.

## Impact

- Frontend dependencies: add an icon library if not already present.
- Frontend presentation layer: app shell, common components, auth UI, project list/detail UI, environment edit UI, loading/error/empty/destructive states.
- Theme system: expand semantic tokens for sidebar, overlays, row hover, muted surfaces, destructive states, and motion/elevation.
- Documentation: update `LLM_CONTEXT.md`, `README.md`, `docs/ROADMAP.md`, `frontend/src/presentation/theme/README.md`, and add a dedicated dashboard UI/UX guide under `docs/`.
- Verification: run frontend build/static checks plus root build/test/lint; visually inspect responsive states where practical.
