"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function PublicHeader() {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useLanguage();

  const isLoggedIn = !!profile;

  const linkClass = (href: string) =>
    pathname === href ? "active" : "";

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <header className="header">
      <Link href="/" className="logo">
        e<span>Konkursi</span>
      </Link>

      <nav className={`nav ${mobileOpen ? "mobile-open" : ""}`}>
        <Link href="/konkurset" className={linkClass("/konkurset")} onClick={() => setMobileOpen(false)}>
          {t("competitions")}
        </Link>
        <Link href="/rezultatet" className={linkClass("/rezultatet")} onClick={() => setMobileOpen(false)}>
          {t("results")}
        </Link>
        <Link href="/ligjet" className={linkClass("/ligjet")} onClick={() => setMobileOpen(false)}>
          {t("laws")}
        </Link>

        {isLoggedIn ? (
          <>
            <Link
              href={profile?.role === "admin" ? "/admin" : "/dashboard"}
              className="nav-btn"
              onClick={() => setMobileOpen(false)}
            >
              {profile?.role === "admin" ? t("panel") : t("dashboard")}
            </Link>
            <button
              onClick={handleLogout}
              style={{
                background: "rgba(255,255,255,0.12)",
                color: "white",
                border: "none",
                padding: "8px 14px",
                borderRadius: "var(--radius-sm)",
                fontWeight: 500,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              {t("logout")}
            </button>
          </>
        ) : (
          <Link href="/" className="nav-btn" onClick={() => setMobileOpen(false)}>
            {t("login_register")}
          </Link>
        )}
      </nav>

      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <LanguageSwitcher />
        <ThemeToggle />
        <button
          className="hamburger"
          aria-label="Menu"
          onClick={() => setMobileOpen((o) => !o)}
        >
          {mobileOpen ? "×" : "≡"}
        </button>
      </div>
    </header>
  );
}
