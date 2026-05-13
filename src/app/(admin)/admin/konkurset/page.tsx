"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/providers/ToastProvider";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import type { Konkurs } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function AdminKonkursetPage() {
  const supabase = createClient();
  const { show } = useToast();
  const { t } = useLanguage();
  const [list, setList] = useState<Konkurs[]>([]);
  const [open, setOpen] = useState(false);
  const [pozita, setPozita] = useState("");
  const [inst, setInst] = useState("");
  const [kat, setKat] = useState("Sherbim Civil");
  const [afati, setAfati] = useState("");
  const [vende, setVende] = useState("1");
  const [paga, setPaga] = useState("");
  const [desc, setDesc] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    const { data } = await supabase.from("konkurset").select("*").order("created_at", { ascending: false });
    setList((data ?? []) as Konkurs[]);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async () => {
    if (!pozita || !inst || !afati) {
      show(t("fill_required_fields"), "error");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("konkurset").insert({
      pozita,
      institucioni: inst,
      kategoria: kat,
      afati,
      vende: parseInt(vende) || 1,
      paga,
      pershkrimi: desc,
      statusi: "aktiv",
    });
    setSubmitting(false);
    if (error) {
      show(error.message, "error");
      return;
    }
    show(t("competition_added"), "success");
    setOpen(false);
    setPozita(""); setInst(""); setAfati(""); setVende("1"); setPaga(""); setDesc("");
    load();
  };

  const del = async (id: number) => {
    if (!confirm(t("delete_confirm"))) return;
    const { error } = await supabase.from("konkurset").delete().eq("id", id);
    if (error) {
      show(error.message, "error");
      return;
    }
    show(t("competition_deleted"), "info");
    load();
  };

  return (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 className="section-title">{t("manage_competitions")}</h1>
          <p className="section-subtitle">{t("manage_competitions_subtitle")}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setOpen(true)}>{t("new_competition")}</button>
      </div>

      <div className="card" style={{ marginBottom: 30 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>{t("position")}</th>
                <th>{t("institution")}</th>
                <th>{t("deadline")}</th>
                <th>{t("applications")}</th>
                <th>{t("status")}</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>
            <tbody>
              {list.map((k) => (
                <tr key={k.id}>
                  <td>#{k.id}</td>
                  <td><strong>{k.pozita}</strong></td>
                  <td>{k.institucioni}</td>
                  <td>{k.afati}</td>
                  <td>{k.aplikime}</td>
                  <td><StatusBadge statusi={k.statusi} /></td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => del(k.id)}>{t("delete")}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={t("add_new_competition")}>
        <div className="form-group">
          <label>{t("position")}</label>
          <input className="form-control" value={pozita} onChange={(e) => setPozita(e.target.value)} />
        </div>
        <div className="form-group">
          <label>{t("institution")}</label>
          <input className="form-control" value={inst} onChange={(e) => setInst(e.target.value)} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-group">
            <label>{t("category")}</label>
            <select className="form-control" value={kat} onChange={(e) => setKat(e.target.value)}>
              <option>{t("civil_service")}</option>
              <option>{t("technology")}</option>
              <option>{t("finance")}</option>
              <option>{t("administrative")}</option>
              <option>{t("legal")}</option>
              <option>{t("inspection")}</option>
            </select>
          </div>
          <div className="form-group">
            <label>{t("deadline")}</label>
            <input className="form-control" type="date" value={afati} onChange={(e) => setAfati(e.target.value)} />
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="form-group">
            <label>{t("vacancies")}</label>
            <input className="form-control" type="number" min={1} value={vende} onChange={(e) => setVende(e.target.value)} />
          </div>
          <div className="form-group">
            <label>{t("salary")}</label>
            <input className="form-control" value={paga} onChange={(e) => setPaga(e.target.value)} placeholder="600-800€" />
          </div>
        </div>
        <div className="form-group">
          <label>{t("description")}</label>
          <textarea className="form-control" rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={submitting} onClick={save}>
            {submitting ? t("saving") : t("save_competition")}
          </button>
          <button className="btn btn-neutral" style={{ flex: 1, justifyContent: "center" }} onClick={() => setOpen(false)}>
            {t("cancel")}
          </button>
        </div>
      </Modal>
    </>
  );
}
