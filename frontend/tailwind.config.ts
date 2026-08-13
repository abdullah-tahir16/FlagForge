import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        app: {
          accent: "rgb(var(--color-accent) / <alpha-value>)",
          "accent-muted": "rgb(var(--color-accent-muted) / <alpha-value>)",
          background: "rgb(var(--color-background) / <alpha-value>)",
          brand: "rgb(var(--color-brand) / <alpha-value>)",
          "brand-muted": "rgb(var(--color-brand-muted) / <alpha-value>)",
          border: "rgb(var(--color-border) / <alpha-value>)",
          danger: "rgb(var(--color-danger) / <alpha-value>)",
          "danger-muted": "rgb(var(--color-danger-muted) / <alpha-value>)",
          destructive: "rgb(var(--color-destructive) / <alpha-value>)",
          "destructive-muted": "rgb(var(--color-destructive-muted) / <alpha-value>)",
          focus: "rgb(var(--color-focus) / <alpha-value>)",
          info: "rgb(var(--color-info) / <alpha-value>)",
          "info-muted": "rgb(var(--color-info-muted) / <alpha-value>)",
          muted: "rgb(var(--color-muted) / <alpha-value>)",
          "on-brand": "rgb(var(--color-on-brand) / <alpha-value>)",
          "on-primary": "rgb(var(--color-on-primary) / <alpha-value>)",
          overlay: "rgb(var(--color-overlay) / <alpha-value>)",
          primary: "rgb(var(--color-primary) / <alpha-value>)",
          "primary-hover": "rgb(var(--color-primary-hover) / <alpha-value>)",
          "primary-muted": "rgb(var(--color-primary-muted) / <alpha-value>)",
          "row-hover": "rgb(var(--color-row-hover) / <alpha-value>)",
          sidebar: "rgb(var(--color-sidebar) / <alpha-value>)",
          "sidebar-active": "rgb(var(--color-sidebar-active) / <alpha-value>)",
          "sidebar-active-text": "rgb(var(--color-sidebar-active-text) / <alpha-value>)",
          "sidebar-border": "rgb(var(--color-sidebar-border) / <alpha-value>)",
          "sidebar-muted": "rgb(var(--color-sidebar-muted) / <alpha-value>)",
          "surface": "rgb(var(--color-surface) / <alpha-value>)",
          "surface-muted": "rgb(var(--color-surface-muted) / <alpha-value>)",
          success: "rgb(var(--color-success) / <alpha-value>)",
          text: "rgb(var(--color-text) / <alpha-value>)",
          "text-muted": "rgb(var(--color-text-muted) / <alpha-value>)",
          topbar: "rgb(var(--color-topbar) / <alpha-value>)",
          warning: "rgb(var(--color-warning) / <alpha-value>)",
          "warning-muted": "rgb(var(--color-warning-muted) / <alpha-value>)"
        }
      },
      borderRadius: {
        app: "var(--radius-md)",
        "app-sm": "var(--radius-sm)"
      },
      boxShadow: {
        app: "var(--shadow-sm)",
        "app-button": "var(--shadow-button)",
        "app-overlay": "var(--shadow-overlay)"
      },
      transitionDuration: {
        "app-fast": "var(--motion-fast)",
        app: "var(--motion-base)",
        "app-slow": "var(--motion-slow)"
      }
    }
  },
  plugins: []
} satisfies Config;
