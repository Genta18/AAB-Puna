"use client";

import Link from "next/link";
import { LIGJET } from "@/lib/ligjet";
import { LanguageProvider, useLanguage } from "@/lib/i18n/LanguageContext";

export default function LigjetPage() {
  const { t } = useLanguage();
  return (
    <div>
      {/* HEADING */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "inline-block",
            background: "rgba(37,99,235,0.12)",
            color: "var(--primary)",
            padding: "6px 14px",
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 14,
            letterSpacing: 0.3,
          }}
        >
          {t("laws")}
        </div>
        <h1 className="section-title" style={{ fontSize: 32, marginBottom: 12 }}>
          {t("laws_and_regulations")}
        </h1>
        <p className="section-subtitle" style={{ marginBottom: 0, maxWidth: 760 }}>
          {t("laws_subtitle")}
        </p>
      </div>

      {/* LIST */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
        }}
      >
        {LIGJET.map((l) => (
          <article
            key={l.id}
            className="card"
            style={{
              padding: 24,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-block",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  color: l.lloji === "rregullore" ? "#b45309" : "var(--primary)",
                  background:
                    l.lloji === "rregullore"
                      ? "rgba(245,158,11,0.15)"
                      : "rgba(37,99,235,0.12)",
                  padding: "3px 10px",
                  borderRadius: 12,
                  marginBottom: 10,
                }}
              >
                {l.lloji === "rregullore" ? t("regulation") : t("law")} · {l.viti}
              </div>
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "var(--text)",
                  margin: 0,
                  lineHeight: 1.35,
                }}
              >
                {l.titulli}
              </h2>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--text2)",
                  marginTop: 4,
                  fontWeight: 500,
                }}
              >
                {l.numri}
              </div>
            </div>

            <p
              style={{
                fontSize: 14,
                color: "var(--text2)",
                lineHeight: 1.6,
                margin: 0,
                flex: 1,
              }}
            >
              {l.pershkrim}
            </p>

            <a
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              style={{ alignSelf: "flex-start", padding: "10px 18px", fontSize: 14 }}
            >
              {t("read_official")}
            </a>
          </article>
        ))}
      </div>

      {/* INFO BOX */}
      <div
        className="card"
        style={{
          marginTop: 36,
          padding: 24,
          background: "var(--bg2)",
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6, color: "var(--text)" }}>
          {t("official_source")}
        </h3>
        <p style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.6, margin: 0 }}>
          {t("official_source_desc_1")}{" "}
          <a
            href="https://gzk.rks-gov.net"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "var(--primary)", fontWeight: 600 }}
          >
            {t("official_source_desc_2")}
          </a>
          . {t("official_source_desc_3")}
        </p>
        <div style={{ marginTop: 14 }}>
          <Link href="/konkurset" className="btn btn-primary" style={{ fontSize: 14 }}>
            {t("view_active_competitions")}
          </Link>
        </div>
      </div>
    </div>
  );
}
