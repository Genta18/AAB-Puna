"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { candidateSidebar } from "@/components/layout/sidebarItems";

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!profile) router.replace("/");
    else if (profile.role !== "kandidat") router.replace("/admin");
  }, [profile, loading, router]);

  if (loading || !profile || profile.role !== "kandidat") {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <p style={{ color: "var(--text2)" }}>Duke ngarkuar...</p>
      </div>
    );
  }

  return <AppShell sidebarItems={candidateSidebar}>{children}</AppShell>;
}
