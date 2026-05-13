"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface Activity {
  user_name: string;
  konkurs: string;
  data: string;
}

export default function AdminDashboardPage() {
  const supabase = createClient();
  const { t } = useLanguage();
  const [stats, setStats] = useState({ konkursAktive: 0, totalAplikime: 0, ankesaAktive: 0, totalUsers: 0 });
  const [activity, setActivity] = useState<Activity[]>([]);

  useEffect(() => {
    (async () => {
      const [
        { count: konkursAktive },
        { count: totalAplikime },
        { count: ankesaAktive },
        { count: totalUsers },
        { data: recent },
      ] = await Promise.all([
        supabase.from("konkurset").select("*", { count: "exact", head: true }).eq("statusi", "aktiv"),
        supabase.from("aplikimet").select("*", { count: "exact", head: true }),
        supabase.from("ankesat").select("*", { count: "exact", head: true }).eq("statusi", "shqyrtim"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase
          .from("aplikimet")
          .select("data, profiles:kandidat_id(name), konkurset:konkurs_id(pozita)")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      setStats({
        konkursAktive: konkursAktive ?? 0,
        totalAplikime: totalAplikime ?? 0,
        ankesaAktive: ankesaAktive ?? 0,
        totalUsers: totalUsers ?? 0,
      });

      const acts: Activity[] = (recent ?? []).map((r: any) => ({
        user_name: r.profiles?.name ?? "Kandidat",
        konkurs: r.konkurset?.pozita ?? "Konkurs",
        data: r.data,
      }));
      setActivity(acts);
    })();
  }, [supabase]);

  const chartData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun"],
    datasets: [
      {
        label: "Aplikime",
        data: [65, 59, 80, 81, 56, 95],
        borderColor: "#125c9c",
        tension: 0.4,
        fill: true,
        backgroundColor: "rgba(18,92,156,0.1)",
      },
    ],
  };

  return (
    <>
      <h1 className="section-title">{t("admin_dashboard")}</h1>
      <p className="section-subtitle">{t("admin_dashboard_subtitle")}</p>

      <div className="stats-grid" style={{ marginBottom: 30 }}>
        <div className="stat-card blue">
          <div className="stat-number">{stats.konkursAktive}</div>
          <div className="stat-label">{t("active_competitions")}</div>
        </div>
        <div className="stat-card green">
          <div className="stat-number">{stats.totalAplikime}</div>
          <div className="stat-label">{t("total_applications")}</div>
        </div>
        <div className="stat-card yellow">
          <div className="stat-number">{stats.ankesaAktive}</div>
          <div className="stat-label">{t("complaints_in_review")}</div>
        </div>
        <div className="stat-card red">
          <div className="stat-number">{stats.totalUsers}</div>
          <div className="stat-label">{t("registered_users")}</div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 className="card-title">{t("applications_activity")}</h3>
          <div style={{ height: 300, marginTop: 12 }}>
            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="card" style={{ padding: 24 }}>
          <h3 className="card-title">{t("recent_activity")}</h3>
          <div style={{ marginTop: 15 }}>
            {activity.length === 0 ? (
              <p style={{ color: "var(--text2)", fontSize: 13 }}>{t("no_activity_yet")}</p>
            ) : (
              activity.map((a, i) => (
                <div key={i} style={{ padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                  <strong>{a.user_name}</strong> {t("applied_for")} <em>{a.konkurs}</em>
                  <div style={{ color: "var(--text2)", fontSize: 11 }}>{formatDate(a.data)}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
