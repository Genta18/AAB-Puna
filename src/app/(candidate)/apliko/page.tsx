"use client";

import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { formatDate, getCountdown } from "@/lib/utils";
import type { Konkurs } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { Dictionary } from "@/lib/i18n/dictionaries";

type UploadKey = "cv" | "diploma" | "extra";

function ApplyInner() {
  const { profile } = useAuth();
  const { show } = useToast();
  const router = useRouter();
  const params = useSearchParams();
  const supabase = createClient();
  const { t } = useLanguage();

  const [konkurset, setKonkurset] = useState<Konkurs[]>([]);
  const [step, setStep] = useState(1);
  const [filterInst, setFilterInst] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [emri, setEmri] = useState("");
  const [mbiemri, setMbiemri] = useState("");
  const [email, setEmail] = useState("");
  const [tel, setTel] = useState("");
  const [np, setNp] = useState("");
  const [arsimi, setArsimi] = useState("");
  const [adresa, setAdresa] = useState("");
  const [uploads, setUploads] = useState<{ cv: File | null; diploma: File | null; extra: File[] }>({
    cv: null, diploma: null, extra: [],
  });
  const [konfirmo, setKonfirmo] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  // Load konkurset
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("konkurset")
        .select("*")
        .eq("statusi", "aktiv")
        .order("afati");
      setKonkurset((data ?? []) as Konkurs[]);
    })();
  }, [supabase]);

  // Prefill from URL + profile
  useEffect(() => {
    const id = params.get("id");
    if (id) setSelectedId(parseInt(id));
  }, [params]);

  useEffect(() => {
    if (profile) {
      const parts = profile.name.split(" ");
      setEmri((p) => p || parts[0] || "");
      setMbiemri((p) => p || parts.slice(1).join(" ") || "");
      setEmail((p) => p || profile.email || "");
    }
  }, [profile]);

  const institucionet = useMemo(
    () => Array.from(new Set(konkurset.map((k) => k.institucioni))),
    [konkurset]
  );

  const visibleKonkurset = useMemo(
    () => konkurset.filter((k) => !filterInst || k.institucioni === filterInst),
    [konkurset, filterInst]
  );

  const selected = useMemo(
    () => konkurset.find((k) => k.id === selectedId) ?? null,
    [konkurset, selectedId]
  );

  const validate = (s: number): boolean => {
    const e: Record<string, boolean> = {};
    if (s === 1 && !selectedId) e.konkurs = true;
    if (s === 2) {
      if (!emri.trim()) e.emri = true;
      if (!mbiemri.trim()) e.mbiemri = true;
      if (!email.trim()) e.email = true;
      if (!tel.trim()) e.tel = true;
      if (!arsimi) e.arsimi = true;
    }
    if (s === 3) {
      if (!uploads.cv) e.cv = true;
      if (!uploads.diploma) e.diploma = true;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goStep = (n: number) => {
    if (n > step && !validate(step)) return;
    setStep(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFile = (type: UploadKey, files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (file.size > 5 * 1024 * 1024) {
      show("Skedari është shumë i madh (max 5MB)", "error");
      return;
    }
    if (type === "cv") setUploads((p) => ({ ...p, cv: file }));
    else if (type === "diploma") setUploads((p) => ({ ...p, diploma: file }));
    else setUploads((p) => ({ ...p, extra: [...p.extra, ...Array.from(files)] }));
    show(`"${file.name}" u ngarkua!`, "success");
  };

  const removeFile = (type: "cv" | "diploma") => {
    setUploads((p) => ({ ...p, [type]: null }));
  };

  const uploadFile = async (file: File, label: string): Promise<string | null> => {
    if (!profile) return null;
    const path = `${profile.id}/${Date.now()}-${label}-${file.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("aplikim-dokumente").upload(path, file);
    if (error) {
      show(`Ngarkimi i ${label} dështoi: ${error.message}`, "error");
      return null;
    }
    return path;
  };

  const submit = async () => {
    if (!konfirmo) {
      setErrors({ konfirmo: true });
      return;
    }
    if (!profile || !selected) return;
    setSubmitting(true);

    const cvUrl = uploads.cv ? await uploadFile(uploads.cv, "cv") : null;
    const diplomaUrl = uploads.diploma ? await uploadFile(uploads.diploma, "diploma") : null;
    const extraUrls: string[] = [];
    for (const f of uploads.extra) {
      const u = await uploadFile(f, "extra");
      if (u) extraUrls.push(u);
    }

    const { error } = await supabase.from("aplikimet").insert({
      kandidat_id: profile.id,
      konkurs_id: selected.id,
      data: new Date().toISOString().slice(0, 10),
      emri, mbiemri, email, tel, np, arsimi, adresa,
      cv_url: cvUrl, diploma_url: diplomaUrl, extra_urls: extraUrls.length ? extraUrls : null,
    });

    setSubmitting(false);
    if (error) {
      show(`Aplikimi dështoi: ${error.message}`, "error");
      return;
    }
    setSuccess(true);
    show("Aplikimi u dërgua me sukses!", "success");
  };

  const pcts = ["25%", "50%", "75%", "100%"];
  const labels = [t("step_1_of_4"), t("step_2_of_4"), t("step_3_of_4"), t("step_4_of_4")];

  if (success) {
    return (
      <div style={{ maxWidth: 700, margin: "0 auto", textAlign: "center", padding: "40px 20px" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: "20px 0 12px" }}>{t("application_sent")}</h2>
        <p style={{ color: "var(--text2)", fontSize: 15, lineHeight: 1.6, maxWidth: 400, margin: "0 auto 28px" }}>
          {t("application_sent_desc")}
        </p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/dashboard" className="btn btn-primary">{t("go_to_dashboard")}</Link>
          <Link href="/konkurset" className="btn btn-neutral">{t("view_competitions")}</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 className="section-title">{t("apply_for_comp_title")}</h1>
        <p className="section-subtitle">{t("apply_subtitle")}</p>
      </div>

      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text2)" }}>{t("application_progress")}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>{labels[step - 1]}</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: pcts[step - 1] }} /></div>
      </div>

      <div className="steps" style={{ marginBottom: 28 }}>
        {[1, 2, 3, 4].map((n, i) => {
          const stepLabels = [t("step_comp"), t("step_data"), t("step_docs"), t("step_confirm")];
          const cls = step === n ? "active" : step > n ? "done" : "";
          return (
            <div key={n} className={`step ${cls}`}>
              <div className="step-num">{n}</div>
              <div className="step-label">{stepLabels[i]}</div>
              {n < 4 && <div className="step-line" />}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div className="card">
          <div className="card-header"><span className="card-title">{t("choose_comp")}</span></div>
          <div className="card-body">
            <div className="form-group">
              <label>{t("institution")}</label>
              <select className="form-control" value={filterInst} onChange={(e) => setFilterInst(e.target.value)}>
                <option value="">{t("all_institutions")}</option>
                {institucionet.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>{t("position_star")}</label>
              <select
                className={`form-control ${errors.konkurs ? "error" : ""}`}
                value={selectedId ?? ""}
                onChange={(e) => setSelectedId(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">{t("choose_position")}</option>
                {visibleKonkurset.map((k) => (
                  <option key={k.id} value={k.id}>{k.pozita} – {k.institucioni}</option>
                ))}
              </select>
              {errors.konkurs && <div className="error-msg" style={{ display: "block" }}>Ju lutemi zgjidhni një konkurs</div>}
            </div>
            {selected && (
              <div style={{
                background: "linear-gradient(135deg,var(--primary),var(--primary-light))",
                color: "white",
                borderRadius: "var(--radius)",
                padding: 20,
                marginBottom: 24,
              }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>{selected.pozita}</h3>
                <p style={{ opacity: 0.85, fontSize: 14 }}>
                  {selected.institucioni} · {selected.paga} · {t("deadline")}: {formatDate(selected.afati)}
                  {" "}<span className={`countdown ${getCountdown(selected.afati).cls}`}>
                    ({getCountdown(selected.afati).text})
                  </span>
                </p>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button className="btn btn-primary" onClick={() => goStep(2)}>{t("continue")}</button>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <div className="card-header"><span className="card-title">{t("personal_data")}</span></div>
          <div className="card-body">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="form-group">
                <label>{t("name_star")}</label>
                <input className={`form-control ${errors.emri ? "error" : ""}`} value={emri} onChange={(e) => setEmri(e.target.value)} />
              </div>
              <div className="form-group">
                <label>{t("surname_star")}</label>
                <input className={`form-control ${errors.mbiemri ? "error" : ""}`} value={mbiemri} onChange={(e) => setMbiemri(e.target.value)} />
              </div>
              <div className="form-group">
                <label>{t("email_star")}</label>
                <input type="email" className={`form-control ${errors.email ? "error" : ""}`} value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="form-group">
                <label>{t("phone_star")}</label>
                <input type="tel" className={`form-control ${errors.tel ? "error" : ""}`} value={tel} onChange={(e) => setTel(e.target.value)} placeholder="+383 4X XXX XXX" />
              </div>
              <div className="form-group">
                <label>{t("personal_number")}</label>
                <input className="form-control" value={np} onChange={(e) => setNp(e.target.value)} />
              </div>
              <div className="form-group">
                <label>{t("education_level_star")}</label>
                <select className={`form-control ${errors.arsimi ? "error" : ""}`} value={arsimi} onChange={(e) => setArsimi(e.target.value)}>
                  <option value="">{t("choose")}</option>
                  <option value="Shkolla e Mesme">{t("high_school")}</option>
                  <option value="Bachelor">{t("bachelor")}</option>
                  <option value="Master">{t("master")}</option>
                  <option value="Doktoratë">{t("phd")}</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>{t("address")}</label>
              <input className="form-control" value={adresa} onChange={(e) => setAdresa(e.target.value)} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <button className="btn btn-neutral" onClick={() => goStep(1)}>{t("go_back")}</button>
              <button className="btn btn-primary" onClick={() => goStep(3)}>{t("continue")}</button>
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <div className="card-header"><span className="card-title">{t("upload_docs")}</span></div>
          <div className="card-body">
            <div className="alert alert-info">
              {t("doc_info")}
            </div>

            <FileUploader
              label="CV / Curriculum Vitae *"
              file={uploads.cv}
              error={errors.cv}
              onChange={(f) => handleFile("cv", f)}
              onRemove={() => removeFile("cv")}
              t={t}
            />
            <FileUploader
              label="Diploma / Certifikata *"
              file={uploads.diploma}
              error={errors.diploma}
              onChange={(f) => handleFile("diploma", f)}
              onRemove={() => removeFile("diploma")}
              t={t}
            />

            <div className="form-group">
              <label>{t("extra_docs")}</label>
              <label
                style={{
                  display: "block",
                  border: "2px dashed var(--border)",
                  borderRadius: "var(--radius)",
                  padding: 32,
                  textAlign: "center",
                  cursor: "pointer",
                  background: "var(--bg2)",
                }}
              >
                <input type="file" accept=".pdf,.doc,.docx" multiple style={{ display: "none" }}
                  onChange={(e) => handleFile("extra", e.target.files)} />
                <p style={{ color: "var(--text2)", fontSize: 14, margin: 0 }}>
                  <strong style={{ color: "var(--text)" }}>{t("extra_docs_info")}</strong>
                </p>
              </label>
              {uploads.extra.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  {uploads.extra.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg2)", borderRadius: "var(--radius-sm)", padding: "10px 14px", marginTop: 6, fontSize: 13 }}>
                      <span style={{ flex: 1, fontWeight: 600 }}>{f.name}</span>
                      <span style={{ color: "var(--text2)" }}>{(f.size / 1024).toFixed(0)} KB</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <button className="btn btn-neutral" onClick={() => goStep(2)}>{t("go_back")}</button>
              <button className="btn btn-primary" onClick={() => goStep(4)}>{t("continue")}</button>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="card">
          <div className="card-header"><span className="card-title">{t("confirm_application")}</span></div>
          <div className="card-body">
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text2)", textTransform: "uppercase", marginBottom: 12, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>{t("step_comp")}</h4>
              <ReviewRow label={t("position")} value={selected?.pozita ?? "—"} />
              <ReviewRow label={t("institution")} value={selected?.institucioni ?? "—"} />
              <ReviewRow label={t("deadline")} value={selected ? formatDate(selected.afati) : "—"} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text2)", textTransform: "uppercase", marginBottom: 12, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>{t("personal_data")}</h4>
              <ReviewRow label={t("name_surname")} value={`${emri} ${mbiemri}`} />
              <ReviewRow label="Email" value={email} />
              <ReviewRow label={t("phone_star").replace(" *", "")} value={tel} />
              <ReviewRow label={t("education_level_star").replace(" *", "")} value={arsimi} />
            </div>
            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: "var(--text2)", textTransform: "uppercase", marginBottom: 12, borderBottom: "1px solid var(--border)", paddingBottom: 8 }}>{t("step_docs")}</h4>
              <ReviewRow label="CV" value={uploads.cv?.name ?? "—"} />
              <ReviewRow label="Diploma" value={uploads.diploma?.name ?? "—"} />
            </div>
            <div className="form-group">
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 14, textTransform: "none", letterSpacing: 0 }}>
                <input type="checkbox" checked={konfirmo} onChange={(e) => setKonfirmo(e.target.checked)} style={{ width: 18, height: 18 }} />
                {t("confirm_checkbox")}
              </label>
              {errors.konfirmo && <div className="error-msg" style={{ display: "block" }}>Duhet të konfirmoni para se të dërgoni</div>}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <button className="btn btn-neutral" onClick={() => goStep(3)} disabled={submitting}>{t("go_back")}</button>
              <button className="btn btn-primary" onClick={submit} disabled={submitting} style={{ padding: "13px 32px" }}>
                {submitting ? t("sending") : t("send_application")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", fontSize: 14, borderBottom: "1px solid var(--border)" }}>
      <span style={{ color: "var(--text2)" }}>{label}</span>
      <span style={{ fontWeight: 600, textAlign: "right", maxWidth: "60%" }}>{value}</span>
    </div>
  );
}

function FileUploader({
  label, file, error, onChange, onRemove, t
}: {
  label: string;
  file: File | null;
  error?: boolean;
  onChange: (f: FileList | null) => void;
  onRemove: () => void;
  t: (key: keyof Dictionary) => string;
}) {
  return (
    <div className="form-group">
      <label>{label}</label>
      <label
        style={{
          display: "block",
          border: `2px dashed ${error ? "#ef4444" : file ? "var(--accent)" : "var(--border)"}`,
          borderRadius: "var(--radius)",
          padding: 32,
          textAlign: "center",
          cursor: "pointer",
          background: "var(--bg2)",
        }}
      >
        <input type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={(e) => onChange(e.target.files)} />
        <p style={{ color: "var(--text2)", fontSize: 14, margin: 0 }}>
          <strong style={{ color: "var(--text)" }}>{t("click_or_drag")}</strong><br />
          PDF, DOC · max 5MB
        </p>
      </label>
      {file && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg2)", borderRadius: "var(--radius-sm)", padding: "10px 14px", marginTop: 10, fontSize: 13 }}>
          <span style={{ flex: 1, fontWeight: 600 }}>{file.name}</span>
          <span style={{ color: "var(--text2)" }}>{(file.size / 1024).toFixed(0)} KB</span>
          <button onClick={onRemove} aria-label="Hiq skedarin" style={{ color: "#ef4444", cursor: "pointer", background: "none", border: "none", fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
      )}
      {error && <div className="error-msg" style={{ display: "block" }}>Ky dokument është i detyrueshëm</div>}
    </div>
  );
}

export default function ApplyPage() {
  return (
    <Suspense fallback={<p>Duke ngarkuar...</p>}>
      <ApplyInner />
    </Suspense>
  );
}
