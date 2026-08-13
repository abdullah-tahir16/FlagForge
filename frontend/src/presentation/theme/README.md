# Theme

The project theme is controlled by CSS variables in `src/styles.css`.

Change values under `:root` to update the whole application:

```css
:root {
  --color-brand: 10 36 45;
  --color-primary: 0 107 96;
  --color-accent: 238 137 36;
  --radius-md: 6px;
  --shadow-sm: 0 1px 2px 0 rgb(18 30 39 / 0.08);
}
```

The default FlagForge palette uses forge teal for primary actions, signal amber for secondary emphasis, graphite neutrals for work surfaces, and clear success/danger states.

Tailwind tokens in `tailwind.config.ts` map to these variables through semantic names such as `app-primary`, `app-accent`, `app-surface`, `app-text`, and `rounded-app`.

## Dashboard Tokens

Dashboard screens should consume semantic tokens only:

- Shell: `app-sidebar`, `app-sidebar-muted`, `app-sidebar-border`, `app-sidebar-active`, `app-sidebar-active-text`, `app-topbar`.
- Surfaces: `app-background`, `app-surface`, `app-surface-muted`, `app-row-hover`, `app-overlay`.
- Text and borders: `app-text`, `app-text-muted`, `app-border`, `app-focus`.
- State: `app-success`, `app-warning`, `app-danger`, `app-info`, plus muted state backgrounds.
- Destructive workflows: `app-destructive`, `app-destructive-muted`.
- Elevation and radius: `shadow-app`, `shadow-app-overlay`, `rounded-app`, `rounded-app-sm`.

Use CSS variables for source values and Tailwind `app-*` utilities in components. Do not place raw Tailwind palette utilities in product UI. If a new status, shell region, or interaction state needs color, add a semantic CSS variable and map it in Tailwind before using it.

Motion should use the CSS variables in `src/styles.css` and must respect `prefers-reduced-motion`.
