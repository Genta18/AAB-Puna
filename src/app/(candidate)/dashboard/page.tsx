"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import type { Aplikim, Konkurs, Njoftim } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function DashboardPage() {
  const { profile } = useAuth();
  const { show } = useToast();
  const supabase = createClient();
  const { t } = useLanguage();

  const [aplikimet, setAplikimet] = useState<(Aplikim & { konkurs?: Konkurs })[]>([]);
  const [njoftimet, setNjoftimet] = useState<Njoftim[]>([]);
  const [ankesaCount, setAnkesaCount] = useState(0);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const [{ data: aps }, { data: ns }, { count }] = await Promise.all([
        supabase
          .from("aplikimet")
          .select("*, konkurs:konkurset(*)")
          .eq("kandidat_id", profile.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("njoftimet")
          .select("*")
          .or(`kandidat_id.is.null,kandidat_id.eq.${profile.id}`)
          .order("data", { ascending: false })
          .limit(10),
        supabase
          .from("ankesat")
          .select("*", { count: "exact", head: true })
          .eq("kandidat_id", profile.id),
      ]);
      setAplikimet((aps ?? []) as any);
      setNjoftimet((ns ?? []) as Njoftim[]);
      setAnkesaCount(count ?? 0);
    })();
  }, [profile, supabase]);

  const pranuar = aplikimet.filter((a) => a.statusi === "pranuar").length;
  const shqyrtim = aplikimet.filter((a) => a.statusi === "shqyrtim").length;

  const markAllRead = async () => {
    if (!profile) return;
    const ids = njoftimet.filter((n) => !n.lexuar && n.kandidat_id === profile.id).map((n) => n.id);
    if (ids.length) {
      await supabase.from("njoftimet").update({ lexuar: true }).in("id", ids);
    }
    setNjoftimet((p) => p.map((n) => ({ ...n, lexuar: true })));
    show("Të gjitha njoftimet u lexuan", "success");
  };

  const markRead = async (id: number) => {
    await supabase.from("njoftimet").update({ lexuar: true }).eq("id", id);
    setNjoftimet((p) => p.map((n) => (n.id === id ? { ...n, lexuar: true } : n)));
  };

  return (
    <>
      {/* WELCOME BAR */}
      <div
        style={{
          background: "linear-gradient(135deg,var(--primary),var(--primary-light))",
          borderRadius: "var(--radius)",
          padding: "28px 32px",
          color: "white",
          marginBottom: 28,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>{t("welcome")} {profile?.name}!</h2>
          <p style={{ opacity: 0.8, fontSize: 14, marginTop: 4 }}>
            {t("candidate_code")} <strong>{profile?.code ?? "—"}</strong> |{" "}
            <span suppressHydrationWarning>
              {new Date().toLocaleDateString("sq-AL", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </p>
        </div>
        <Link href="/apliko" className="btn btn-primary">
          {t("apply_for_competition")}
        </Link>
      </div>

      {/* STATS */}
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card blue">
          <div className="stat-number">{aplikimet.length}</div>
          <div className="stat-label">{t("my_applications")}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-number">{pranuar}</div>
          <div className="stat-label">{t("accepted")}</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-number">{shqyrtim}</div>
          <div className="stat-label">{t("in_review")}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-number">{ankesaCount}</div>
          <div className="stat-label">{t("my_complaints")}</div>
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 28 }}>
        {[
          { href: "/konkurset", label: t("view_competitions") },
          { href: "/rezultatet", label: t("my_results") },
          { href: "/ankesat", label: t("submit_complaint") },
        ].map((a) => (
          <Link key={a.href} href={a.href} className="card" style={{ textAlign: "center", padding: 20, textDecoration: "none", color: "var(--text)" }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{a.label}</span>
          </Link>
        ))}
      </div>

      {/* APLIKIMET & NJOFTIMET */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">{t("my_applications")}</span>
            <Link href="/apliko" className="btn btn-sm btn-primary">{t("new_masculine")}</Link>
          </div>
          <div className="card-body">
            {aplikimet.length === 0 ? (
              <p style={{ color: "var(--text2)", fontSize: 14, textAlign: "center", padding: "20px 0" }}>
                {t("no_applications_yet")}<br />
                <Link href="/apliko" className="btn btn-sm btn-primary" style={{ marginTop: 12, display: "inline-flex" }}>
                  {t("apply_now")}
                </Link>
              </p>
            ) : (
              aplikimet.map((a) => (
                <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 0", borderBottom: "1px solid var(--border)" }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{a.konkurs?.pozita ?? "Konkurs"}</h4>
                    <p style={{ fontSize: 12, color: "var(--text2)" }}>
                      {a.konkurs?.institucioni ?? ""} · {formatDate(a.data)}
                    </p>
                  </div>
                  <StatusBadge statusi={a.statusi} />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">{t("notifications")}</span>
            <button className="btn btn-sm btn-neutral" onClick={markAllRead}>
              {t("read_all")}
            </button>
          </div>
          <div className="card-body">
            {njoftimet.length === 0 ? (
              <p style={{ color: "var(--text2)", fontSize: 14, textAlign: "center", padding: 20 }}>
                {t("no_notifications")}
              </p>
            ) : (
              njoftimet.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--border)", cursor: "pointer" }}
                >
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: n.lexuar ? "var(--border)" : "#3b82f6",
                      marginTop: 5,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>
                      {n.tekst}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text2)", marginTop: 3 }}>
                      {formatDate(n.data)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
