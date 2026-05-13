import { ReactNode } from "react";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { ChatBot } from "@/components/chat/ChatBot";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <PublicHeader />
      <main style={{ padding: "32px 5%", maxWidth: 1280, margin: "0 auto", minHeight: "calc(100vh - 68px - 80px)" }}>
        {children}
      </main>
      <footer>
        <strong>eKonkursi</strong> – Transparencë. Meritë. Besim.
        <br />
        <span style={{ fontSize: 13, opacity: 0.6 }}>
          © 2026 SIMBNJ – Sistemi i Menaxhimit të Burimeve Njerëzore
        </span>
      </footer>
      <ChatBot />
    </>
  );
}
