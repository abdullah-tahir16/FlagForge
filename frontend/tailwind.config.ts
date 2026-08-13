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
          focus: "rgb(var(--color-focus) / <alpha-value>)",
          muted: "rgb(var(--color-muted) / <alpha-value>)",
          "on-brand": "rgb(var(--color-on-brand) / <alpha-value>)",
          primary: "rgb(var(--color-primary) / <alpha-value>)",
          "primary-hover": "rgb(var(--color-primary-hover) / <alpha-value>)",
          "primary-muted": "rgb(var(--color-primary-muted) / <alpha-value>)",
          "surface": "rgb(var(--color-surface) / <alpha-value>)",
          "surface-muted": "rgb(var(--color-surface-muted) / <alpha-value>)",
          success: "rgb(var(--color-success) / <alpha-value>)",
          text: "rgb(var(--color-text) / <alpha-value>)",
          "text-muted": "rgb(var(--color-text-muted) / <alpha-value>)",
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
        "app-button": "var(--shadow-button)"
      }
    }
  },
  plugins: []
} satisfies Config;
