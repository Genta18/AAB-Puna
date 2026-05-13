"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/providers/ToastProvider";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Row {
  id: number;
  data: string;
  statusi: string;
  candidate_name: string;
  konkurs_pozita: string;
}

export default function AdminAplikimetPage() {
  const supabase = createClient();
  const { show } = useToast();
  const { t } = useLanguage();
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");

  const load = async () => {
    const { data } = await supabase
      .from("aplikimet")
      .select("id, data, statusi, profiles:kandidat_id(name), konkurset:konkurs_id(pozita)")
      .order("created_at", { ascending: false });
    setRows(
      (data ?? []).map((r: any) => ({
        id: r.id,
        data: r.data,
        statusi: r.statusi,
        candidate_name: r.profiles?.name ?? "N/A",
        konkurs_pozita: r.konkurset?.pozita ?? "N/A",
      }))
    );
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = async (id: number, statusi: string) => {
    const { error } = await supabase.from("aplikimet").update({ statusi }).eq("id", id);
    if (error) {
      show(error.message, "error");
      return;
    }
    show(t("application_updated"), "success");
    load();
  };

  const filtered = rows.filter((r) => !q || r.candidate_name.toLowerCase().includes(q.toLowerCase()));

  return (
    <>
      <h1 className="section-title">{t("review_applications")}</h1>
      <p className="section-subtitle">{t("review_applications_subtitle")}</p>

      <div className="search-bar">
        <input className="search-input" placeholder={t("search_candidate")} value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>{t("candidate_name")}</th>
                <th>{t("competition")}</th>
                <th>{t("date")}</th>
                <th>{t("status")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td>#{r.id}</td>
                  <td>{r.candidate_name}</td>
                  <td>{r.konkurs_pozita}</td>
                  <td>{formatDate(r.data)}</td>
                  <td><StatusBadge statusi={r.statusi} /></td>
                  <td style={{ display: "flex", gap: 5 }}>
                    <button className="btn btn-sm btn-primary" onClick={() => update(r.id, "pranuar")}>{t("approve")}</button>
                    <button className="btn btn-sm btn-danger" onClick={() => update(r.id, "refuzuar")}>{t("reject")}</button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text2)" }}>{t("no_results")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
