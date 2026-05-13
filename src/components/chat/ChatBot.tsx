"use client";

import { useEffect, useRef, useState } from "react";

type Role = "user" | "assistant";

interface Msg {
  role: Role;
  content: string;
}

const INITIAL_GREETING =
  "Përshëndetje! Jam asistenti virtual i eKonkursi. Mund të më pyesni si të aplikoni, si funksionojnë rezultatet ose ankesat, dhe gjithçka tjetër rreth platformës.";

export function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: INITIAL_GREETING },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streaming]);

  // Cleanup on unmount
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const next: Msg[] = [
      ...messages,
      { role: "user", content: text },
      { role: "assistant", content: "" },
    ];
    setMessages(next);
    setInput("");
    setStreaming(true);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next
            .slice(0, -1) // drop the empty assistant placeholder
            .filter((m) => m.content.trim().length > 0)
            .map((m) => ({ role: m.role, content: m.content })),
        }),
        signal: ctrl.signal,
      });

      if (!res.ok) {
        let errMsg = `Gabim ${res.status}.`;
        try {
          const j = await res.json();
          if (j?.error) errMsg = j.error;
        } catch {
          /* ignore */
        }
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: errMsg,
          };
          return copy;
        });
        return;
      }

      if (!res.body) {
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = {
            role: "assistant",
            content: "Nuk ka përgjigje nga serveri.",
          };
          return copy;
        });
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch (err) {
      if ((err as any)?.name === "AbortError") return;
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content:
            "Nuk mund të lidhem me serverin. Provoni përsëri më vonë.",
        };
        return copy;
      });
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  const stop = () => {
    abortRef.current?.abort();
  };

  return (
    <div className="chat-widget">
      <button
        className="chat-button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Open chat"
        style={{ fontSize: 24, fontWeight: 700, letterSpacing: 0.5 }}
      >
        ❓
      </button>
      <div className={`chat-window ${open ? "active" : ""}`}>
        <div className="chat-header">
          <h3>Asistenti Virtual</h3>
          <button
            style={{
              background: "none",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: 22,
              lineHeight: 1,
            }}
            onClick={() => setOpen(false)}
            aria-label="Close chat"
          >
            ×
          </button>
        </div>

        <div className="chat-messages" ref={scrollRef}>
          {messages.map((m, i) => {
            const isStreamingThis =
              streaming && i === messages.length - 1 && m.role === "assistant";
            return (
              <div key={i} className={`message ${m.role === "user" ? "user" : "bot"}`}>
                {m.role === "assistant" && !m.content && isStreamingThis ? (
                  <TypingDots />
                ) : (
                  <span style={{ whiteSpace: "pre-wrap" }}>
                    {m.content}
                    {isStreamingThis && m.content && (
                      <span className="chat-caret">▌</span>
                    )}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="chat-input-area">
          <input
            type="text"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={
              streaming ? "Asistenti po përgjigjet..." : "Shkruaj pyetjen këtu..."
            }
            disabled={streaming}
          />
          {streaming ? (
            <button
              className="chat-send"
              onClick={stop}
              aria-label="Stop"
              style={{ background: "#ef4444", fontSize: 12, fontWeight: 700 }}
              title="Ndalo"
            >
              Stop
            </button>
          ) : (
            <button
              className="chat-send"
              onClick={send}
              aria-label="Send"
              disabled={!input.trim()}
              style={{ fontSize: 12, fontWeight: 700 }}
            >
              Dërgo
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <span className="chat-typing-dots" aria-label="Po shkruan...">
      <span />
      <span />
      <span />
    </span>
  );
}
