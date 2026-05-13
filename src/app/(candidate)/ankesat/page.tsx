"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { formatDate } from "@/lib/utils";
import type { Ankesa, Konkurs } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AnkesatPage() {
  const { profile } = useAuth();
  const { show } = useToast();
  const supabase = createClient();
  const { t } = useLanguage();
  const [ankesat, setAnkesat] = useState<Ankesa[]>([]);
  const [konkurset, setKonkurset] = useState<Konkurs[]>([]);
  const [open, setOpen] = useState(false);
  const [tema, setTema] = useState("");
  const [kat, setKat] = useState("");
  const [desc, setDesc] = useState("");
  const [konkursId, setKonkursId] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    if (!profile) return;
    const [{ data: as }, { data: ks }] = await Promise.all([
      supabase.from("ankesat").select("*").eq("kandidat_id", profile.id).order("data", { ascending: false }),
      supabase.from("konkurset").select("*"),
    ]);
    setAnkesat((as ?? []) as Ankesa[]);
    setKonkurset((ks ?? []) as Konkurs[]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const submit = async () => {
    const e: Record<string, boolean> = {};
    if (!kat) e.kat = true;
    if (!tema.trim()) e.tema = true;
    if (!desc.trim()) e.desc = true;
    setErrors(e);
    if (Object.keys(e).length || !profile) return;

    setSubmitting(true);
    const { error } = await supabase.from("ankesat").insert({
      kandidat_id: profile.id,
      tema,
      kategoria: kat,
      pershkrimi: desc,
      konkurs_id: konkursId ? parseInt(konkursId) : null,
    });
    setSubmitting(false);
    if (error) {
      show(`Gabim: ${error.message}`, "error");
      return;
    }
    show("Ankesa juaj u regjistrua me sukses!", "success");
    setOpen(false);
    setTema(""); setKat(""); setDesc(""); setKonkursId("");
    setErrors({});
    load();
  };

  const inShqyrtim = ankesat.filter((a) => a.statusi === "shqyrtim").length;
  const zgjidhur = ankesat.filter((a) => a.statusi === "zgjidhur").length;

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 14, marginBottom: 28 }}>
        <div>
          <h1 className="section-title">{t("complaints_system")}</h1>
          <p className="section-subtitle">{t("complaints_subtitle")}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>{t("submit_complaint_btn")}</button>
      </div>

      <div className="alert alert-info">
        {t("complaint_info")}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start", marginTop: 20 }}>
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>{t("my_complaints")}</h3>
          {ankesat.length === 0 ? (
            <div style={{ textAlign: "center", padding: "48px 20px", color: "var(--text2)" }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{t("you_have_no_complaints")}</h3>
              <p>{t("complaint_call_to_action")}</p>
              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setOpen(true)}>{t("submit_complaint_btn")}</button>
            </div>
          ) : (
            ankesat.map((a) => (
              <div key={a.id} className="card" style={{ padding: 22, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "var(--text2)", fontWeight: 600 }}>{t("complaint_number")}{a.id} · {a.kategoria}</span>
                  <StatusBadge statusi={a.statusi} />
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{a.tema}</div>
                <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 14 }}>{t("submitted_on")} {formatDate(a.data)}</div>
                <div style={{ fontSize: 14, lineHeight: 1.6, background: "var(--bg2)", padding: 12, borderRadius: "var(--radius-sm)" }}>
                  {a.pershkrimi}
                </div>
              </div>
            ))
          )}
        </div>

        <div>
          <div className="card">
            <div className="card-header"><span className="card-title">{t("complaint_process")}</span></div>
            <div className="card-body">
              {[
                { d: "1", t: t("cp_step_1_title"), s: t("cp_step_1_desc") },
                { d: "2", t: t("cp_step_2_title"), s: t("cp_step_2_desc") },
                { d: "3", t: t("cp_step_3_title"), s: t("cp_step_3_desc") },
                { d: "4", t: t("cp_step_4_title"), s: t("cp_step_4_desc") },
                { d: "5", t: t("cp_step_5_title"), s: t("cp_step_5_desc") },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, paddingBottom: 16 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: i < 2 ? "var(--accent)" : i === 2 ? "var(--primary-light)" : "var(--bg2)",
                    color: i < 3 ? "white" : "var(--text2)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 14, flexShrink: 0, border: i >= 3 ? "2px solid var(--border)" : "none",
                  }}>
                    {s.d}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{s.t}</h4>
                    <p style={{ fontSize: 12, color: "var(--text2)" }}>{s.s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-header"><span className="card-title">{t("statistics")}</span></div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Row label={t("my_complaints")} value={ankesat.length.toString()} />
              <Row label={t("in_review")} value={inShqyrtim.toString()} color="#f59e0b" />
              <Row label={t("resolved")} value={zgjidhur.toString()} color="#22c55e" />
            </div>
          </div>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={t("submit_new_complaint")} maxWidth="560px">
        <div className="alert alert-warning">{t("complaint_warning")}</div>

        <div className="form-group">
          <label>{t("complaint_category_star")}</label>
          <select className={`form-control ${errors.kat ? "error" : ""}`} value={kat} onChange={(e) => setKat(e.target.value)}>
            <option value="">{t("choose_category")}</option>
            <option>Rezultate - Pikë të gabuara</option>
            <option>Procedura - Shkelje procedurash</option>
            <option>Diskriminim</option>
            <option>Dokumente - Vlerësim i padrejtë</option>
            <option>Tjetër</option>
          </select>
        </div>

        <div className="form-group">
          <label>{t("topic_star")}</label>
          <input className={`form-control ${errors.tema ? "error" : ""}`} value={tema} onChange={(e) => setTema(e.target.value)} />
        </div>

        <div className="form-group">
          <label>{t("related_competition_optional")}</label>
          <select className="form-control" value={konkursId} onChange={(e) => setKonkursId(e.target.value)}>
            <option value="">{t("choose_position").replace("— ", "— ").replace(" —", " —")}</option>
            {konkurset.map((k) => <option key={k.id} value={k.id}>{k.pozita} – {k.institucioni}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label>{t("description_star")}</label>
          <textarea className={`form-control ${errors.desc ? "error" : ""}`} rows={5} value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <button onClick={() => setOpen(false)} className="btn btn-neutral" disabled={submitting}>{t("cancel")}</button>
          <button onClick={submit} className="btn btn-primary" disabled={submitting}>
            {submitting ? t("sending") : t("send_complaint")}
          </button>
        </div>
      </Modal>
    </>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 14, color: "var(--text2)" }}>{label}</span>
      <span style={{ fontWeight: 700, fontSize: 16, color: color ?? "var(--text)" }}>{value}</span>
    </div>
  );
}
