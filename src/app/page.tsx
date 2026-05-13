"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { ChatBot } from "@/components/chat/ChatBot";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { LanguageSwitcher } from "@/components/ui/LanguageSwitcher";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LIGJET } from "@/lib/ligjet";
import type { UserRole } from "@/lib/types";

type AuthMode = "login" | "register" | "forgot";

export default function LandingPage() {
  const router = useRouter();
  const { profile, loading, signIn, signUp, resetPassword } = useAuth();
  const { show } = useToast();
  const { t } = useLanguage();

  const [mode, setMode] = useState<AuthMode>("login");
  const [loginRole, setLoginRole] = useState<UserRole>("kandidat");
  const [regRole, setRegRole] = useState<UserRole>("kandidat");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [err, setErr] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const loginEmailRef = useRef<HTMLInputElement>(null);

  // Redirect logged-in users
  useEffect(() => {
    if (!loading && profile) {
      router.replace(profile.role === "admin" ? "/admin" : "/dashboard");
    }
  }, [loading, profile, router]);

  const scrollToLogin = (msg?: string) => {
    setMobileNavOpen(false);
    setMode("login");
    if (msg) show(msg, "warning");
    setTimeout(() => {
      document
        .getElementById("loginSection")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      loginEmailRef.current?.focus({ preventScroll: true });
    }, 100);
  };

  const handleGuardedClick = (e: React.MouseEvent, label: string) => {
    e.preventDefault();
    scrollToLogin(`Duhet të kyçeni për të parë "${label}"`);
  };

  const doLogin = async () => {
    setErr("");
    if (!loginEmail || !loginPass) {
      setErr("Ju lutem plotësoni të gjitha fushat!");
      return;
    }
    setSubmitting(true);
    const res = await signIn(loginEmail, loginPass, loginRole);
    setSubmitting(false);
    if (res.ok && res.profile) {
      show(`Mirë se vini, ${res.profile.name}!`, "success");
      router.push(res.profile.role === "admin" ? "/admin" : "/dashboard");
      router.refresh();
    } else {
      setErr(res.msg ?? "Hyrja dështoi.");
      show(res.msg ?? "Hyrja dështoi.", "error");
    }
  };

  const doRegister = async () => {
    setErr("");
    if (!regName || !regEmail || !regPass) {
      setErr("Ju lutem plotësoni të gjitha fushat!");
      return;
    }
    if (regPass.length < 6) {
      setErr("Fjalëkalimi duhet të jetë së paku 6 karaktere.");
      return;
    }
    setSubmitting(true);
    const res = await signUp(regName, regEmail, regPass, regRole);
    setSubmitting(false);
    if (res.ok) {
      show("Llogaria u krijua me sukses! Hyni tani.", "success");
      setMode("login");
      setLoginEmail(regEmail);
      setLoginPass("");
    } else {
      setErr(res.msg ?? "Regjistrimi dështoi.");
      show(res.msg ?? "Regjistrimi dështoi.", "error");
    }
  };

  const doForgot = async () => {
    setErr("");
    if (!forgotEmail) {
      setErr("Vendos email-in!");
      return;
    }
    setSubmitting(true);
    const res = await resetPassword(forgotEmail);
    setSubmitting(false);
    if (res.ok) {
      show(res.msg ?? "Email-i u dërgua!", "success");
      setMode("login");
    } else {
      setErr(res.msg ?? "Dështoi.");
      show(res.msg ?? "Dështoi.", "error");
    }
  };

  return (
    <>
      <header className="header">
        <Link href="/" className="logo">
          e<span>Konkursi</span>
        </Link>
        <nav className={`nav ${mobileNavOpen ? "mobile-open" : ""}`} id="mainNav">
          <Link href="/konkurset" onClick={() => setMobileNavOpen(false)}>
            {t("competitions")}
          </Link>
          <Link href="/rezultatet" onClick={() => setMobileNavOpen(false)}>
            {t("results")}
          </Link>
          <Link href="/ligjet" onClick={() => setMobileNavOpen(false)}>
            {t("laws")}
          </Link>
          <a href="#ankesat-link" onClick={(e) => handleGuardedClick(e, t("complaints"))}>
            {t("complaints")}
          </a>
          <a
            href="#loginSection"
            className="nav-btn"
            onClick={(e) => {
              e.preventDefault();
              scrollToLogin();
            }}
          >
            {t("login_register")}
          </a>
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <LanguageSwitcher />
          <ThemeToggle />
          <button
            className="hamburger"
            aria-label="Menu"
            onClick={() => setMobileNavOpen((o) => !o)}
          >
            {mobileNavOpen ? "×" : "≡"}
          </button>
        </div>
      </header>

      {/* HERO */}
      <div className="hero">
        <div className="hero-grid">
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(34,197,94,0.2)",
                border: "1px solid rgba(34,197,94,0.4)",
                color: "#4ade80",
                padding: "6px 16px",
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 20,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  background: "#22c55e",
                  borderRadius: "50%",
                  animation: "pulse 1.5s infinite",
                }}
              />
              {t("live_system")}
            </div>
            <h1>
              {t("hero_title_1")} <span>{t("hero_title_2")}</span> {t("hero_title_3")}
            </h1>
            <p>
              {t("hero_desc")}
            </p>
            <div style={{ marginBottom: 28, display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["Aplikim Online", "Rezultate Live", "Ankesa Elektronike", "Të Dhëna të Sigurta"].map((p) => (
                <span
                  key={p}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    background: "rgba(255,255,255,0.1)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    color: "rgba(255,255,255,0.9)",
                    padding: "5px 14px",
                    borderRadius: 20,
                    fontSize: 13,
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
            <div className="hero-btns">
              <Link href="/konkurset" className="btn btn-primary">
                {t("view_competitions")}
              </Link>
              <a
                href="#si-funksionon"
                className="btn btn-outline"
                onClick={(e) => {
                  e.preventDefault();
                  document
                    .getElementById("si-funksionon")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {t("how_it_works")}
              </a>
            </div>
          </div>

          {/* AUTH CARD */}
          <div className="login-card" id="loginSection">
            {mode === "login" && (
              <div>
                <h2>{t("login_to_platform")}</h2>
                <div className="role-tabs">
                  <button
                    className={`role-tab ${loginRole === "kandidat" ? "active" : ""}`}
                    onClick={() => setLoginRole("kandidat")}
                  >
                    {t("candidate")}
                  </button>
                  <button
                    className={`role-tab ${loginRole === "admin" ? "active" : ""}`}
                    onClick={() => setLoginRole("admin")}
                  >
                    {t("administrator")}
                  </button>
                </div>
                <div className="form-group">
                  <label>{t("email")}</label>
                  <input
                    ref={loginEmailRef}
                    className="form-control"
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>{t("password")}</label>
                  <input
                    className="form-control"
                    type="password"
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doLogin()}
                  />
                </div>
                <button
                  className="btn btn-dark"
                  style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
                  disabled={submitting}
                  onClick={doLogin}
                >
                  {submitting ? t("logging_in") : t("login")}
                </button>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20, fontSize: 13 }}>
                  <button
                    style={{ background: "none", border: "none", color: "var(--text2)", cursor: "pointer" }}
                    onClick={() => { setMode("forgot"); setErr(""); }}
                  >
                    {t("forgot_password")}
                  </button>
                  <span style={{ color: "var(--text2)" }}>
                    {t("dont_have_account")}{" "}
                    <button
                      style={{ background: "none", border: "none", color: "var(--primary-light)", fontWeight: 600, cursor: "pointer" }}
                      onClick={() => { setMode("register"); setErr(""); }}
                    >
                      {t("register")}
                    </button>
                  </span>
                </div>
                {err && <div className="error-msg" style={{ display: "block", marginTop: 10, textAlign: "center" }}>{err}</div>}
              </div>
            )}

            {mode === "register" && (
              <div>
                <h2>{t("create_account")}</h2>
                <div className="role-tabs">
                  <button
                    className={`role-tab ${regRole === "kandidat" ? "active" : ""}`}
                    onClick={() => setRegRole("kandidat")}
                  >
                    {t("candidate")}
                  </button>
                  <button
                    className={`role-tab ${regRole === "admin" ? "active" : ""}`}
                    onClick={() => setRegRole("admin")}
                  >
                    {t("administrator")}
                  </button>
                </div>
                <div className="form-group">
                  <label>{t("full_name")}</label>
                  <input className="form-control" type="text" value={regName} onChange={(e) => setRegName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>{t("email")}</label>
                  <input className="form-control" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label>{t("password")}</label>
                  <input className="form-control" type="password" value={regPass} onChange={(e) => setRegPass(e.target.value)} />
                </div>
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
                  disabled={submitting}
                  onClick={doRegister}
                >
                  {submitting ? t("registering") : t("register")}
                </button>
                <div style={{ textAlign: "center", marginTop: 15, fontSize: 14, color: "var(--text2)" }}>
                  {t("already_have_account")}{" "}
                  <button
                    style={{ background: "none", border: "none", color: "var(--primary-light)", fontWeight: 600, cursor: "pointer" }}
                    onClick={() => { setMode("login"); setErr(""); }}
                  >
                    {t("login_here")}
                  </button>
                </div>
                {err && <div className="error-msg" style={{ display: "block", marginTop: 10, textAlign: "center" }}>{err}</div>}
              </div>
            )}

            {mode === "forgot" && (
              <div>
                <h2>{t("change_password")}</h2>
                <div className="alert alert-info" style={{ fontSize: 12, marginBottom: 15 }}>
                  {t("forgot_password_info")}
                </div>
                <div className="form-group">
                  <label>{t("email")}</label>
                  <input className="form-control" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
                </div>
                <button
                  className="btn btn-dark"
                  style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
                  disabled={submitting}
                  onClick={doForgot}
                >
                  {submitting ? t("sending") : t("send_email")}
                </button>
                <div style={{ textAlign: "center", marginTop: 15, fontSize: 14 }}>
                  <button
                    style={{ background: "none", border: "none", color: "var(--primary-light)", fontWeight: 600, cursor: "pointer" }}
                    onClick={() => { setMode("login"); setErr(""); }}
                  >
                    {t("back_to_login")}
                  </button>
                </div>
                {err && <div className="error-msg" style={{ display: "block", marginTop: 10, textAlign: "center" }}>{err}</div>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* STATS SECTION */}
      <section className="section" style={{ background: "var(--bg2)" }}>
        <div className="container-wide">
          <div className="stats-grid">
            <div className="stat-card blue animate-fade animate-delay-1">
              <div className="stat-number"><AnimatedCounter target={12} /></div>
              <div className="stat-label">{t("active_competitions")}</div>
              <div className="stat-change up">▲ +3</div>
            </div>
            <div className="stat-card green animate-fade animate-delay-2">
              <div className="stat-number"><AnimatedCounter target={486} /></div>
              <div className="stat-label">{t("total_applicants")}</div>
              <div className="stat-change up">▲ +58</div>
            </div>
            <div className="stat-card yellow animate-fade animate-delay-3">
              <div className="stat-number"><AnimatedCounter target={74} /></div>
              <div className="stat-label">{t("accepted_candidates")}</div>
              <div className="stat-change up">▲ 15.2%</div>
            </div>
            <div className="stat-card red animate-fade animate-delay-3">
              <div className="stat-number"><AnimatedCounter target={18} /></div>
              <div className="stat-label">{t("active_complaints")}</div>
              <div className="stat-change down">▼ -2</div>
            </div>
          </div>
        </div>
      </section>

      {/* SI FUNKSIONON */}
      <section className="section" id="si-funksionon">
        <div className="container-wide">
          <h2 className="section-title" style={{ textAlign: "center" }}>
            {t("how_ekonkursi_works")}
          </h2>
          <p className="section-subtitle" style={{ textAlign: "center" }}>
            {t("simple_transparent_process")}
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 }}>
            {[
              { n: 1, t: t("register"), d: t("register_desc") },
              { n: 2, t: t("apply_online"), d: t("apply_online_desc") },
              { n: 3, t: t("track_status"), d: t("track_status_desc") },
              { n: 4, t: t("results_complaints"), d: t("results_complaints_desc") },
            ].map((s, idx) => (
              <div
                key={s.n}
                className={`card animate-fade ${idx > 0 ? `animate-delay-${idx}` : ""}`}
                style={{ textAlign: "center", padding: "32px 20px" }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg,var(--primary),var(--primary-light))",
                    color: "white",
                    fontSize: 22,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  {s.n}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{s.t}</h3>
                <p style={{ fontSize: 13, color: "var(--text2)", lineHeight: 1.6 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section" style={{ background: "var(--bg2)" }}>
        <div className="container-wide">
          <h2 className="section-title" style={{ textAlign: "center" }}>
            {t("main_features")}
          </h2>
          <p className="section-subtitle" style={{ textAlign: "center" }}>
            {t("everything_you_need")}
          </p>
          <div className="features-grid">
            {[
              { t: t("digital_application"), d: t("digital_application_desc") },
              { t: t("automatic_ranking"), d: t("automatic_ranking_desc") },
              { t: t("online_complaints"), d: t("online_complaints_desc") },
              { t: t("audit_trail"), d: t("audit_trail_desc") },
              { t: t("guaranteed_privacy"), d: t("guaranteed_privacy_desc") },
              { t: t("statistical_reports"), d: t("statistical_reports_desc") },
            ].map((f, i) => (
              <div
                key={f.t}
                className={`feature-card animate-fade ${i > 0 && i < 4 ? `animate-delay-${i}` : ""}`}
              >
                <h3>{f.t}</h3>
                <p>{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BAZA LIGJORE */}
      <section className="section" id="baza-ligjore">
        <div className="container-wide">
          <h2 className="section-title" style={{ textAlign: "center" }}>
            {t("legal_basis")}
          </h2>
          <p className="section-subtitle" style={{ textAlign: "center" }}>
            {t("platform_functions_in_compliance")}
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
              gap: 18,
              marginBottom: 28,
            }}
          >
            {LIGJET.map((l, i) => (
              <a
                key={l.id}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`card animate-fade ${i > 0 && i < 4 ? `animate-delay-${i}` : ""}`}
                style={{
                  padding: 22,
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  transition: "var(--transition)",
                }}
              >
                <div
                  style={{
                    display: "inline-block",
                    alignSelf: "flex-start",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 0.4,
                    textTransform: "uppercase",
                    color: l.lloji === "rregullore" ? "#b45309" : "var(--primary)",
                    background:
                      l.lloji === "rregullore"
                        ? "rgba(245,158,11,0.15)"
                        : "rgba(37,99,235,0.12)",
                    padding: "4px 10px",
                    borderRadius: 10,
                  }}
                >
                  {l.numri}
                </div>
                <h3
                  style={{
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--text)",
                    margin: 0,
                    lineHeight: 1.4,
                  }}
                >
                  {l.titulli}
                </h3>
                <span
                  style={{
                    fontSize: 13,
                    color: "var(--primary-light)",
                    fontWeight: 600,
                    marginTop: "auto",
                  }}
                >
                  {t("read_more")}
                </span>
              </a>
            ))}
          </div>
          <div style={{ textAlign: "center" }}>
            <Link href="/ligjet" className="btn btn-outline">
              {t("view_all_legal_acts")}
            </Link>
          </div>
        </div>
      </section>

      {/* TRUST STATS */}
      <div className="trust-section">
        <h2>{t("trusted_platform")}</h2>
        <p>{t("ekonkursi_official_system")}</p>
        <div className="trust-stats">
          <div className="trust-stat">
            <h3><AnimatedCounter target={47} /></h3>
            <p>{t("member_institutions")}</p>
          </div>
          <div className="trust-stat">
            <h3><AnimatedCounter target={1240} /></h3>
            <p>{t("completed_competitions")}</p>
          </div>
          <div className="trust-stat">
            <h3><AnimatedCounter target={98} suffix="%" /></h3>
            <p>{t("resolved_complaints")}</p>
          </div>
          <div className="trust-stat">
            <h3><AnimatedCounter target={24} suffix="h" /></h3>
            <p>{t("support_hours")}</p>
          </div>
        </div>
      </div>

      <footer>
        <strong>{t("ekonkursi_slogan")}</strong>
        <br />
        <span style={{ fontSize: 13, opacity: 0.6 }}>
          © {new Date().getFullYear()} SIMBNJ – Sistemi i Menaxhimit të Burimeve Njerëzore
        </span>
      </footer>

      <ChatBot />
    </>
  );
}
