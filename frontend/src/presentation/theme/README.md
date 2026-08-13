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
