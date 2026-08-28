import { NextResponse } from "next/server";

/**
 * Endpunkt für das Kontaktformular.
 *
 * Bewusst ohne externe Validierungs- oder Mail-Bibliothek: Solange kein
 * Provider konfiguriert ist, wird die Anfrage serverseitig protokolliert. Ist
 * `RESEND_API_KEY` gesetzt, geht sie zusätzlich als Mail raus. Ein Wechsel des
 * Providers betrifft nur `sendMail()`.
 */

type ContactPayload = {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  message?: string;
  privacy?: string;
  /** Honeypot – von Menschen nie ausgefüllt. */
  website?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Sehr einfaches In-Memory-Rate-Limit pro IP. */
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function rateLimited(ip: string) {
  const now = Date.now();
  const entry = attempts.get(ip);

  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

function validate(payload: ContactPayload) {
  if (payload.website) return "Ungültige Anfrage.";
  if (!payload.name?.trim()) return "Bitte geben Sie Ihren Namen an.";
  if (!payload.company?.trim()) return "Bitte geben Sie Ihr Unternehmen an.";
  if (!payload.email || !EMAIL_PATTERN.test(payload.email)) {
    return "Bitte geben Sie eine gültige E-Mail-Adresse an.";
  }
  if ((payload.message?.trim().length ?? 0) < 10) {
    return "Bitte beschreiben Sie Ihr Vorhaben in mindestens 10 Zeichen.";
  }
  if (!payload.privacy) return "Bitte stimmen Sie der Datenschutzerklärung zu.";
  return null;
}

async function sendMail(payload: ContactPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const recipient = process.env.CONTACT_RECIPIENT;

  if (!apiKey || !recipient) {
    // Kein Provider konfiguriert – Anfrage geht nicht verloren, sondern
    // landet im Server-Log bzw. in der Log-Pipeline des Hosters.
    console.info("[kontakt] Neue Anfrage (kein Mail-Provider konfiguriert):", {
      ...payload,
      // Nachricht gekürzt, damit Logs lesbar bleiben.
      message: payload.message?.slice(0, 400),
    });
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Pixel Werk <website@pixelwerk.de>",
      to: [recipient],
      reply_to: payload.email,
      subject: `Neue Anfrage: ${payload.company}`,
      text: [
        `Name:         ${payload.name}`,
        `Unternehmen:  ${payload.company}`,
        `E-Mail:       ${payload.email}`,
        `Telefon:      ${payload.phone || "–"}`,
        "",
        payload.message,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    throw new Error(`Mailversand fehlgeschlagen (${response.status})`);
  }
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unbekannt";

  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Zu viele Anfragen. Bitte versuchen Sie es später erneut." },
      { status: 429 },
    );
  }

  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Ungültige Anfrage." }, { status: 400 });
  }

  const error = validate(payload);
  if (error) {
    return NextResponse.json({ ok: false, error }, { status: 400 });
  }

  try {
    await sendMail(payload);
  } catch (cause) {
    console.error("[kontakt] Versand fehlgeschlagen:", cause);
    return NextResponse.json(
      { ok: false, error: "Der Versand ist fehlgeschlagen. Bitte schreiben Sie uns direkt per E-Mail." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
