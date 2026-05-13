"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { formatDate, getCountdown } from "@/lib/utils";
import type { Konkurs } from "@/lib/types";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const PER_PAGE = 6;

export default function KonkursetPage() {
  const supabase = createClient();
  const router = useRouter();
  const { profile } = useAuth();
  const { show } = useToast();
  const { t } = useLanguage();

  const [all, setAll] = useState<Konkurs[]>([]);
  const [search, setSearch] = useState("");
  const [statusi, setStatusi] = useState("te_gjitha");
  const [kategoria, setKategoria] = useState("te_gjitha");
  const [sort, setSort] = useState<"afati" | "aplikime">("afati");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Konkurs | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("konkurset")
        .select("*")
        .order("created_at", { ascending: false });
      setAll((data ?? []) as Konkurs[]);
    })();
  }, [supabase]);

  const filtered = useMemo(() => {
    let list = [...all];
    if (statusi !== "te_gjitha") list = list.filter((k) => k.statusi === statusi);
    if (kategoria !== "te_gjitha") list = list.filter((k) => k.kategoria === kategoria);
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (k) => k.pozita.toLowerCase().includes(q) || k.institucioni.toLowerCase().includes(q)
      );
    }
    if (sort === "afati") list.sort((a, b) => new Date(a.afati).getTime() - new Date(b.afati).getTime());
    if (sort === "aplikime") list.sort((a, b) => b.aplikime - a.aplikime);
    return list;
  }, [all, search, statusi, kategoria, sort]);

  const pageList = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const pages = Math.ceil(filtered.length / PER_PAGE);

  useEffect(() => setPage(1), [search, statusi, kategoria, sort]);

  const handleApliko = (e: React.MouseEvent, konkursId: number) => {
    if (profile?.role === "kandidat") return; // let the Link navigate
    e.preventDefault();
    if (profile?.role === "admin") {
      show("Adminët nuk mund të aplikojnë për konkurse.", "warning");
      return;
    }
    // Not logged in
    show("Duhet të kyçeni për të aplikuar!", "warning");
    router.push(`/?next=/apliko?id=${konkursId}`);
  };

  return (
    <>
      <div style={{ marginBottom: 24 }}>
        <h1 className="section-title">{t("public_competitions")}</h1>
        <p className="section-subtitle">
          {profile
            ? t("public_competitions_subtitle_auth")
            : t("public_competitions_subtitle_guest")}
        </p>
      </div>

      {!profile && (
        <div className="alert alert-info" style={{ marginBottom: 20 }}>
          {t("guest_alert_1")} <Link href="/" style={{ color: "var(--primary-light)", fontWeight: 700 }}>{t("guest_alert_login")}</Link> {t("guest_alert_or")} <Link href="/" style={{ color: "var(--primary-light)", fontWeight: 700 }}>{t("guest_alert_register")}</Link> {t("guest_alert_2")}
        </div>
      )}

      <div className="search-bar">
        <input
          className="search-input"
          placeholder={t("search_placeholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="filter-select" value={statusi} onChange={(e) => setStatusi(e.target.value)}>
          <option value="te_gjitha">{t("all_statuses")}</option>
          <option value="aktiv">{t("status_active")}</option>
          <option value="shqyrtim">{t("status_review")}</option>
          <option value="mbyllur">{t("status_closed")}</option>
        </select>
        <select className="filter-select" value={kategoria} onChange={(e) => setKategoria(e.target.value)}>
          <option value="te_gjitha">{t("all_categories")}</option>
          <option>Sherbim Civil</option>
          <option>Administrativ</option>
          <option>Financa</option>
          <option>Teknologji</option>
          <option>Juridik</option>
          <option>Inspektim</option>
        </select>
        <select className="filter-select" value={sort} onChange={(e) => setSort(e.target.value as any)}>
          <option value="afati">{t("sort_deadline")}</option>
          <option value="aplikime">{t("sort_applications")}</option>
        </select>
      </div>

      <div style={{ color: "var(--text2)", fontSize: 14, marginBottom: 16 }}>
        {filtered.length} {t("competitions_found")}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 20 }}>
        {pageList.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--text2)", gridColumn: "1/-1" }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>
              {t("no_competitions_found")}
            </h3>
            <p>{t("try_change_filters")}</p>
          </div>
        ) : (
          pageList.map((k) => {
            const cd = getCountdown(k.afati);
            const isAktiv = k.statusi === "aktiv";
            return (
              <div
                key={k.id}
                className="card animate-fade"
                style={{ padding: 24, transition: "var(--transition)" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14, gap: 10 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--primary-light)",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      background: "var(--bg2)",
                      padding: "3px 10px",
                      borderRadius: 20,
                    }}
                  >
                    {k.kategoria}
                  </span>
                  <StatusBadge statusi={k.statusi} />
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{k.pozita}</div>
                <div style={{ fontSize: 13, color: "var(--text2)", marginBottom: 14 }}>{k.institucioni}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 16, fontSize: 12, color: "var(--text2)" }}>
                  <div>{t("deadline")}: <strong className={`countdown ${cd.cls}`}>{cd.text}</strong></div>
                  <div>{t("applications")}: <strong>{k.aplikime}</strong></div>
                  <div>{t("vacancies")}: <strong>{k.vende}</strong></div>
                  <div>{t("salary")}: {k.paga}</div>
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    onClick={() => setSelected(k)}
                    className="btn btn-sm btn-neutral"
                    style={{ flex: 1 }}
                  >
                    {t("details")}
                  </button>
                  {isAktiv && (
                    <Link
                      href={`/apliko?id=${k.id}`}
                      className="btn btn-sm btn-primary"
                      style={{ flex: 1, justifyContent: "center" }}
                      onClick={(e) => handleApliko(e, k.id)}
                    >
                      {t("apply")}
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 32 }}>
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              style={{
                width: 38,
                height: 38,
                borderRadius: "var(--radius-sm)",
                border: "1.5px solid var(--border)",
                background: p === page ? "var(--primary)" : "var(--card)",
                color: p === page ? "white" : "var(--text)",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.pozita ?? ""}
        maxWidth="620px"
      >
        {selected && (
          <>
            <div className="alert alert-info">
              <strong>{selected.institucioni}</strong> · {selected.kategoria}
            </div>
            <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7, marginBottom: 20 }}>
              {selected.pershkrimi}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div className="stat-card blue" style={{ padding: 16 }}>
                <div className="stat-label">{t("vacancies_open")}</div>
                <div className="stat-number" style={{ fontSize: 28 }}>{selected.vende}</div>
              </div>
              <div className="stat-card green" style={{ padding: 16 }}>
                <div className="stat-label">{t("applications_so_far")}</div>
                <div className="stat-number" style={{ fontSize: 28 }}>{selected.aplikime}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 14 }}>
              <div><strong>{t("deadline")}:</strong> {formatDate(selected.afati)}</div>
              <div><strong>{t("salary")}:</strong> {selected.paga}</div>
              <div><strong>{t("status")}:</strong> <StatusBadge statusi={selected.statusi} /></div>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              {selected.statusi === "aktiv" && (
                <Link
                  href={`/apliko?id=${selected.id}`}
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                  onClick={(e) => handleApliko(e, selected.id)}
                >
                  {t("apply_now")}
                </Link>
              )}
              <button onClick={() => setSelected(null)} className="btn btn-neutral">
                {t("close")}
              </button>
            </div>
          </>
        )}
      </Modal>
    </>
  );
}
