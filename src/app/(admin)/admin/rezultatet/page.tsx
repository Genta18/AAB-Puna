"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/providers/ToastProvider";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface AppRow {
  id: number;
  kandidat_id: string;
  candidate_name: string;
  candidate_code: string;
  pika_testi: number;
  pika_intervistes: number;
}

export default function AdminRezultatetPage() {
  const supabase = createClient();
  const { show } = useToast();
  const { t } = useLanguage();
  
  const [konkurset, setKonkurset] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [rows, setRows] = useState<AppRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("konkurset").select("id, pozita, institucioni").order("created_at", { ascending: false });
      setKonkurset(data ?? []);
    })();
  }, [supabase]);

  useEffect(() => {
    if (!selectedId) {
      setRows([]);
      return;
    }
    loadAplikimet(parseInt(selectedId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const loadAplikimet = async (kId: number) => {
    const { data } = await supabase
      .from("aplikimet")
      .select("id, kandidat_id, pika_testi, pika_intervistes, profiles:kandidat_id(name, code)")
      .eq("konkurs_id", kId)
      .eq("statusi", "pranuar");
    
    setRows(
      (data ?? []).map((r: any) => ({
        id: r.id,
        kandidat_id: r.kandidat_id,
        candidate_name: r.profiles?.name ?? "N/A",
        candidate_code: r.profiles?.code ?? "N/A",
        pika_testi: r.pika_testi || 0,
        pika_intervistes: r.pika_intervistes || 0,
      }))
    );
  };

  const handlePointChange = (id: number, field: "pika_testi" | "pika_intervistes", val: string) => {
    const num = parseInt(val) || 0;
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: num } : r)));
  };

  const savePoints = async () => {
    setSaving(true);
    for (const r of rows) {
      await supabase.from("aplikimet").update({ pika_testi: r.pika_testi, pika_intervistes: r.pika_intervistes }).eq("id", r.id);
    }
    setSaving(false);
    show(t("points_updated"), "success");
  };

  const publishResults = async () => {
    if (!selectedId) return;
    const k = konkurset.find(x => x.id.toString() === selectedId);
    if (!k) return;

    setPublishing(true);

    // Save points first just in case
    for (const r of rows) {
      await supabase.from("aplikimet").update({ pika_testi: r.pika_testi, pika_intervistes: r.pika_intervistes }).eq("id", r.id);
    }

    // Sort by total descending
    const sorted = [...rows].sort((a, b) => {
      const ta = a.pika_testi + a.pika_intervistes;
      const tb = b.pika_testi + b.pika_intervistes;
      return tb - ta;
    });

    // Delete old results for this konkurs
    await supabase.from("rezultatet").delete().eq("konkurs", k.pozita);

    // Insert new results
    const toInsert = sorted.map((r, i) => {
      const totali = r.pika_testi + r.pika_intervistes;
      return {
        kodi: r.candidate_code,
        emri: r.candidate_name,
        konkurs: k.pozita,
        pika_testi: r.pika_testi,
        pika_intervistes: r.pika_intervistes,
        vendi: i + 1,
        statusi: totali >= 70 ? "kaloi" : "refuzuar"
      };
    });

    if (toInsert.length > 0) {
      const { error } = await supabase.from("rezultatet").insert(toInsert);
      if (error) {
        show(error.message, "error");
        setPublishing(false);
        return;
      }
    }

    // Optional: update konkurs status to 'mbyllur' if not already
    await supabase.from("konkurset").update({ statusi: "mbyllur" }).eq("id", k.id);

    setPublishing(false);
    show(t("results_published"), "success");
  };

  return (
    <>
      <h1 className="section-title">{t("publish_results")}</h1>
      <p className="section-subtitle">{t("publish_results_subtitle")}</p>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="card-body">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>{t("choose_comp")}</label>
            <select className="form-control" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
              <option value="">{t("choose_position").replace("— ", "— ").replace(" —", " —")}</option>
              {konkurset.map((k) => (
                <option key={k.id} value={k.id}>{k.pozita} – {k.institucioni}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedId && (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>{t("candidate_name")}</th>
                  <th>{t("code")}</th>
                  <th style={{ width: 120 }}>{t("test")} (0-100)</th>
                  <th style={{ width: 120 }}>{t("interview")} (0-40)</th>
                  <th>{t("total")}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.candidate_name}</strong></td>
                    <td>{r.candidate_code}</td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        style={{ padding: "4px 8px", minHeight: 32 }}
                        value={r.pika_testi}
                        onChange={(e) => handlePointChange(r.id, "pika_testi", e.target.value)}
                        min={0} max={100}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-control"
                        style={{ padding: "4px 8px", minHeight: 32 }}
                        value={r.pika_intervistes}
                        onChange={(e) => handlePointChange(r.id, "pika_intervistes", e.target.value)}
                        min={0} max={40}
                      />
                    </td>
                    <td>
                      <strong>{r.pika_testi + r.pika_intervistes}</strong>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "var(--text2)", padding: 30 }}>
                      {t("no_approved_applications")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {rows.length > 0 && (
            <div className="card-body" style={{ display: "flex", gap: 12, justifyContent: "flex-end", borderTop: "1px solid var(--border)" }}>
              <button className="btn btn-neutral" onClick={savePoints} disabled={saving || publishing}>
                {saving ? t("saving") : t("save_points")}
              </button>
              <button className="btn btn-primary" onClick={publishResults} disabled={saving || publishing}>
                {publishing ? t("saving") : t("publish_button")}
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
