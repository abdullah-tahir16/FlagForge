import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        forge: {
          50: "#eef6ff",
          100: "#d9ebff",
          500: "#2563eb",
          600: "#1d4ed8",
          900: "#13213f"
        }
      }
    }
  },
  plugins: []
} satisfies Config;
