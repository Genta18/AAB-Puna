"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/providers/AuthProvider";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { ReactNode } from "react";
import type { SidebarItemData } from "./sidebarItems";

export interface SidebarItem {
  href?: string;
  label?: string;
  section?: string; // section divider label above this item
  divider?: boolean;
  badge?: ReactNode;
}

interface SidebarProps {
  items: SidebarItemData[];
  open?: boolean;
}

export function Sidebar({ items, open }: SidebarProps) {
  const { profile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();

  const initial = profile?.name?.charAt(0).toUpperCase() ?? "?";
  const roleLabel = profile?.role === "admin" ? t("administrator") : t("candidate");

  const handleLogout = async () => {
    await signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <aside className={`sidebar ${open ? "open" : ""}`} id="sidebar">
      <div className="sidebar-user">
        <div className="sidebar-avatar">{initial}</div>
        <div className="sidebar-name">{profile?.name ?? "—"}</div>
        <div className="sidebar-role">{roleLabel}</div>
      </div>
      <hr className="sidebar-divider" />
      <nav className="sidebar-nav">
        {items.map((it, idx) => {
          if (it.divider) return <hr key={idx} className="sidebar-divider" />;
          if (it.sectionKey) {
            return (
              <div key={idx}>
                <div className="sidebar-section-label">{t(it.sectionKey)}</div>
                {it.href && (
                  <Link
                    href={it.href}
                    className={pathname === it.href ? "active" : ""}
                  >
                    {t(it.labelKey as any)}
                    {it.badge}
                  </Link>
                )}
              </div>
            );
          }
          if (!it.href) {
            return (
              <button key={idx} onClick={handleLogout}>
                {t(it.labelKey as any)}
              </button>
            );
          }
          return (
            <Link
              key={idx}
              href={it.href}
              className={pathname === it.href ? "active" : ""}
            >
              {t(it.labelKey as any)}
              {it.badge}
            </Link>
          );
        })}
        <hr className="sidebar-divider" />
        <button onClick={handleLogout}>
          {t("logout")}
        </button>
      </nav>
    </aside>
  );
}
