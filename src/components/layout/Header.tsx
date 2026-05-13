"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";

interface HeaderProps {
  /** Optional center nav items shown on desktop only. */
  centerNav?: ReactNode;
  /** Right-side extras (e.g. notification badge). */
  rightExtras?: ReactNode;
  /** Show hamburger button. */
  onHamburger?: () => void;
  /** Suffix appended to the logo (e.g. " Admin"). */
  suffix?: string;
}

export function Header({ centerNav, rightExtras, onHamburger, suffix }: HeaderProps) {
  return (
    <header className="header">
      <Link href="/" className="logo">
        e<span>Konkursi</span>
        {suffix}
      </Link>
      {centerNav && <nav className="nav">{centerNav}</nav>}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {rightExtras}
        <LanguageSwitcher />
        <ThemeToggle />
        <button className="hamburger" onClick={onHamburger} aria-label="Menu">
          ≡
        </button>
      </div>
    </header>
  );
}
