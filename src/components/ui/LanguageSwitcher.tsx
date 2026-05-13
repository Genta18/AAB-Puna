"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as "sq" | "en" | "sr")}
      style={{
        background: "var(--bg2)",
        color: "var(--text)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-sm)",
        padding: "4px 8px",
        fontSize: "13px",
        outline: "none",
        cursor: "pointer",
        fontWeight: 600
      }}
    >
      <option value="sq">SQ</option>
      <option value="en">EN</option>
      <option value="sr">SR</option>
    </select>
  );
}
