import { NextRequest } from "next/server";

export const runtime = "edge";

const SYSTEM_PROMPT = `Ti je asistenti virtual i platformës **eKonkursi** — sistemi zyrtar digjital për transparencën e konkurseve publike në Kosovë.

ROLI YT:
- Ndihmon kandidatët dhe vizitorët të kuptojnë si funksionon platforma.
- Përgjigjesh GJITHMONË në gjuhën **shqipe**, qartë dhe shkurt (max 4-6 fjali për përgjigje normale).
- Përdor ton miqësor, profesional dhe inkurajues.
- Mos përdor emoji në përgjigjet e tua — mbaj stilin tekstual dhe profesional.

DI KËTO PËR PLATFORMËN eKonkursi:

**Kush mund të përdorë:** Çdo qytetar i Kosovës që dëshiron të aplikojë për pozita në sektorin publik (ministri, komuna, agjenci).

**Si të aplikosh:**
1. Regjistrohu me email në faqen kryesore (tab "Kandidat").
2. Shko te "Konkurset" → zgjidh një konkurs aktiv → kliko "Apliko".
3. Plotëso formularin 4-hapësh: Konkursi → Të Dhënat Personale → Dokumentet (CV, Diplomë në PDF max 5MB) → Konfirmim.
4. Pas dërgimit, statusi do të jetë "Në shqyrtim".

**Përcjellja e statusit:** Te dashboard-i juaj shihni të gjitha aplikimet dhe statusin: Në shqyrtim, Pranuar, ose Refuzuar. Njoftimet vijnë automatikisht me email.

**Rezultatet:** Publikohen anonimisht me kod kandidati (p.sh. K-1025) për të mbrojtur privatësinë. Shfaqen pikët e testit, intervistës dhe totali, plus renditja.

**Ankesat:**
- Mund të paraqiten brenda **5 ditëve pune** nga publikimi i rezultateve.
- Bëhen elektronikisht në seksionin "Ankesat".
- Kategoritë: Pikë të gabuara, Shkelje procedurash, Diskriminim, Vlerësim i padrejtë i dokumenteve, Tjetër.
- Shqyrtohen brenda **10 ditëve pune** dhe rezultati njoftohet me email.

**Fjalëkalimi i harruar:** Në faqen e hyrjes kliko "Harruat fjalëkalimin?" → vendos email-in → do të marrësh një lidhje për ndryshim.

**Llojet e konkurseve:** Sherbim Civil, Administrativ, Financa, Teknologji, Juridik, Inspektim.

**Siguria:** Të dhënat janë të enkriptuara. Kandidati sheh vetëm aplikimet e veta. Vlerësimi bëhet me kod anonim për paanshmëri.

**Kontakt:** support@ekonkursi.gov.net

RREGULLA:
- Mos shpik fakte për konkurse specifike (data, paga, kushte) — thuaj userit të shohë te "Konkurset" për detaje aktuale.
- Mos kërko të dhëna personale (numër ID, fjalëkalim).
- Nëse pyetja nuk ka lidhje me eKonkursi (p.sh. politika, lajme, etj.) ktheje me edukatë te tema e platformës.
- Nëse nuk e di përgjigjen, sugjero kontaktin me support@ekonkursi.gov.net.`;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "GROQ_API_KEY mungon në .env.local" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Trupi i pavlefshëm." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const messages = body.messages ?? [];
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "Nuk ka mesazhe." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Keep only the last ~10 turns to limit context size.
  const trimmed = messages
    .filter(
      (m): m is ChatMessage =>
        typeof m?.content === "string" &&
        (m.role === "user" || m.role === "assistant")
    )
    .slice(-10);

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...trimmed],
      temperature: 0.5,
      max_tokens: 600,
      stream: true,
    }),
  });

  if (!groqRes.ok || !groqRes.body) {
    const text = await groqRes.text().catch(() => "");
    return new Response(
      JSON.stringify({
        error: `Groq error (${groqRes.status})`,
        detail: text.slice(0, 500),
      }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }

  // Re-pipe Groq's SSE stream, emitting just the text deltas as plain chunks.
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = groqRes.body!.getReader();
      let buffer = "";
      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line.startsWith("data:")) continue;
            const data = line.slice(5).trim();
            if (data === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              const delta: string | undefined =
                json?.choices?.[0]?.delta?.content;
              if (delta) controller.enqueue(encoder.encode(delta));
            } catch {
              // Ignore malformed chunk
            }
          }
        }
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "X-Accel-Buffering": "no",
    },
  });
}
