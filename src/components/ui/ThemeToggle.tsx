"use client";

import { useTheme } from "@/components/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      title={theme === "dark" ? "Kalo në temë të çelët" : "Kalo në temë të errët"}
      aria-label="Toggle theme"
      style={{ fontSize: 13, fontWeight: 700, letterSpacing: 0.5 }}
    >
      {theme === "dark" ? "L" : "D"}
    </button>
  );
}
