"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/providers/ToastProvider";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface Row {
  id: number;
  tema: string;
  data: string;
  statusi: string;
  candidate_name: string;
}

export default function AdminAnkesatPage() {
  const supabase = createClient();
  const { show } = useToast();
  const { t } = useLanguage();
  const [rows, setRows] = useState<Row[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("ankesat")
      .select("id, tema, data, statusi, profiles:kandidat_id(name)")
      .order("created_at", { ascending: false });
    setRows(
      (data ?? []).map((r: any) => ({
        id: r.id,
        tema: r.tema,
        data: r.data,
        statusi: r.statusi,
        candidate_name: r.profiles?.name ?? "N/A",
      }))
    );
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = async (id: number, statusi: string) => {
    const { error } = await supabase.from("ankesat").update({ statusi }).eq("id", id);
    if (error) {
      show(error.message, "error");
      return;
    }
    show(t("complaint_updated"), "success");
    load();
  };

  return (
    <>
      <h1 className="section-title">{t("manage_complaints")}</h1>
      <p className="section-subtitle">{t("manage_complaints_subtitle")}</p>

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>{t("candidate_name")}</th>
                <th>{t("topic")}</th>
                <th>{t("date")}</th>
                <th>{t("status")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>#{r.id}</td>
                  <td>{r.candidate_name}</td>
                  <td>{r.tema}</td>
                  <td>{formatDate(r.data)}</td>
                  <td><StatusBadge statusi={r.statusi} /></td>
                  <td style={{ display: "flex", gap: 5 }}>
                    <button className="btn btn-sm btn-primary" onClick={() => update(r.id, "zgjidhur")}>{t("resolve")}</button>
                    <button className="btn btn-sm btn-danger" onClick={() => update(r.id, "refuzuar")}>{t("reject")}</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: "center", color: "var(--text2)" }}>{t("no_complaints_admin")}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
