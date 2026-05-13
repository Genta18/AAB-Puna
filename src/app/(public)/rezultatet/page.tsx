"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { StatusBadge } from "@/components/ui/StatusBadge";
import type { Rezultat } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type SortCol = "pika_testi" | "pika_intervistes" | "totali";

export default function RezultatetPage() {
  const supabase = createClient();
  const { profile } = useAuth();
  const { t } = useLanguage();
  const [all, setAll] = useState<Rezultat[]>([]);
  const [search, setSearch] = useState("");
  const [sortCol, setSortCol] = useState<SortCol>("totali");
  const [sortDir, setSortDir] = useState<-1 | 1>(-1);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("rezultatet")
        .select("*")
        .order("totali", { ascending: false });
      setAll((data ?? []) as Rezultat[]);
    })();
  }, [supabase]);

  const myCode = profile?.code ?? null;
  const myRez = useMemo(() => all.find((r) => r.kodi === myCode), [all, myCode]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = all.filter(
      (r) => r.kodi.toLowerCase().includes(q) || r.emri.toLowerCase().includes(q) || r.konkurs.toLowerCase().includes(q)
    );
    return [...list].sort((a, b) => (a[sortCol] - b[sortCol]) * sortDir);
  }, [all, search, sortCol, sortDir]);

  const handleSort = (c: SortCol) => {
    if (sortCol === c) setSortDir((d) => (d === 1 ? -1 : 1) as -1 | 1);
    else {
      setSortCol(c);
      setSortDir(-1);
    }
  };

  const chartData = {
    labels: all.map((r) => r.kodi),
    datasets: [
      { label: t("test"), data: all.map((r) => r.pika_testi), backgroundColor: "rgba(59,130,246,0.7)", borderRadius: 6 },
      { label: t("interview"), data: all.map((r) => r.pika_intervistes), backgroundColor: "rgba(34,197,94,0.7)", borderRadius: 6 },
    ],
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-title">{t("results_title")}</h1>
        <p className="section-subtitle">{t("results_subtitle")}</p>
      </div>

      {!profile && (
        <div className="alert alert-info" style={{ marginBottom: 20 }}>
          {t("results_guest_alert_1")}{" "}
          <Link href="/" style={{ color: "var(--primary-light)", fontWeight: 700 }}>{t("guest_alert_login")}</Link>
          {" "}{t("results_guest_alert_2")}
        </div>
      )}

      {myRez && (
        <div style={{
          background: "linear-gradient(135deg,#0b2f5b,#125c9c)",
          borderRadius: "var(--radius)",
          padding: 28,
          color: "white",
          marginBottom: 28,
          display: "flex",
          alignItems: "center",
          gap: 24,
          flexWrap: "wrap",
        }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%", background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 28, fontWeight: 800,
          }}>
            {profile?.name?.charAt(0) ?? "?"}
          </div>
          <div style={{ flex: 1, minWidth: 250 }}>
            <h2 style={{ fontSize: 22, fontWeight: 700 }}>{profile?.name}</h2>
            <p style={{ opacity: 0.8, fontSize: 14, marginTop: 4 }}>{myRez.konkurs}</p>
            <div style={{ marginTop: 16, maxWidth: 400 }}>
              <ScoreBar label={t("test")} value={myRez.pika_testi} max={100} color="blue" />
              <ScoreBar label={t("interview")} value={myRez.pika_intervistes} max={40} color="green" />
              <ScoreBar label={t("total")} value={myRez.totali} max={140} color="purple" />
            </div>
          </div>
        </div>
      )}

      {myRez && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 28 }}>
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 52, fontWeight: 800, color: "var(--primary)" }}>{myRez.vendi}</div>
            <div style={{ color: "var(--text2)", fontSize: 14, marginTop: 4 }}>{t("rank_in_list")}</div>
          </div>
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 52, fontWeight: 800, color: "var(--primary)" }}>{myRez.totali}</div>
            <div style={{ color: "var(--text2)", fontSize: 14, marginTop: 4 }}>{t("total_points")}</div>
          </div>
          <div className="card" style={{ padding: 24, textAlign: "center" }}>
            <div style={{ fontSize: 32, fontWeight: 800, color: "var(--primary)" }}>
              {myRez.statusi === "kaloi" ? t("status_passed") : myRez.statusi === "refuzuar" ? t("status_rejected") : t("status_waiting")}
            </div>
            <div style={{ color: "var(--text2)", fontSize: 14, marginTop: 4 }}>{t("status")}</div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">{t("full_list")}</span>
            <input
              className="search-input"
              style={{ minWidth: 160, marginBottom: 0 }}
              placeholder={t("search_code")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t("code")}</th>
                  <th>{t("position")}</th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("pika_testi")}>
                    {t("test")} {sortCol === "pika_testi" ? (sortDir === 1 ? "↑" : "↓") : ""}
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("pika_intervistes")}>
                    {t("interview")} {sortCol === "pika_intervistes" ? (sortDir === 1 ? "↑" : "↓") : ""}
                  </th>
                  <th style={{ cursor: "pointer" }} onClick={() => handleSort("totali")}>
                    {t("total")} {sortCol === "totali" ? (sortDir === 1 ? "↑" : "↓") : ""}
                  </th>
                  <th>{t("status")}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => {
                  const isMe = r.kodi === myCode;
                  return (
                    <tr key={r.id} style={isMe ? { background: "rgba(34,197,94,0.08)", fontWeight: 700 } : {}}>
                      <td>{i + 1}</td>
                      <td>{r.kodi} {isMe && <span className="badge badge-green">{t("you")}</span>}</td>
                      <td><span style={{ fontSize: 12, color: "var(--text2)" }}>{r.konkurs}</span></td>
                      <td>{r.pika_testi}</td>
                      <td>{r.pika_intervistes}</td>
                      <td><strong>{r.totali}</strong></td>
                      <td><StatusBadge statusi={r.statusi} /></td>
                      <td>{isMe && r.statusi !== "kaloi" && (
                        <Link href="/ankesat" className="btn btn-sm btn-danger">{t("complain")}</Link>
                      )}</td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--text2)" }}>{t("no_results")}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">{t("visual_comparison")}</span></div>
          <div className="card-body" style={{ height: 280 }}>
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <div className="alert alert-info" style={{ marginTop: 20 }}>
        {t("results_info_1")}
        {profile?.role === "kandidat" && (
          <> {t("results_info_2")} <Link href="/ankesat" style={{ color: "var(--primary-light)", fontWeight: 700 }}>{t("results_info_3")}</Link>.</>
        )}
      </div>
    </>
  );
}

function ScoreBar({ label, value, max, color }: { label: string; value: number; max: number; color: "blue" | "green" | "purple" }) {
  const colors: Record<string, string> = {
    blue: "linear-gradient(90deg,#3b82f6,#60a5fa)",
    green: "linear-gradient(90deg,#22c55e,#4ade80)",
    purple: "linear-gradient(90deg,#8b5cf6,#a78bfa)",
  };
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6, fontWeight: 600 }}>
        <span>{label}</span>
        <span>{value} pikë</span>
      </div>
      <div style={{ height: 10, background: "rgba(255,255,255,0.15)", borderRadius: 5, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min((value / max) * 100, 100)}%`, background: colors[color], transition: "width 1.2s ease" }} />
      </div>
    </div>
  );
}
