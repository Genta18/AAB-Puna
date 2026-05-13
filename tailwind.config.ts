import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  darkMode: ["class", "[data-theme='dark']"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        primary: {
          DEFAULT: "var(--primary)",
          light: "var(--primary-light)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          dark: "var(--accent-dark)",
        },
        bg: {
          DEFAULT: "var(--bg)",
          alt: "var(--bg2)",
        },
        card: "var(--card)",
        text: {
          DEFAULT: "var(--text)",
          muted: "var(--text2)",
        },
        border: "var(--border)",
      },
      borderRadius: {
        DEFAULT: "var(--radius)",
        sm: "var(--radius-sm)",
      },
      boxShadow: {
        soft: "var(--shadow)",
        lg: "var(--shadow-lg)",
      },
    },
  },
  plugins: [],
};

export default config;
