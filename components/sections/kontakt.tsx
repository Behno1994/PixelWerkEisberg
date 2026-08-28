"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Check, Loader2, Mail, Phone } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";

type FormState = "idle" | "sending" | "success" | "error";

export function Kontakt() {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setState("sending");
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { ok: boolean; error?: string };

      if (!response.ok || !result.ok) {
        setState("error");
        setMessage(result.error ?? "Die Anfrage konnte nicht gesendet werden.");
        return;
      }

      setState("success");
      event.currentTarget.reset();
    } catch {
      setState("error");
      setMessage("Netzwerkfehler – bitte später erneut versuchen.");
    }
  };

  return (
    <section id="kontakt" className="relative z-10 py-24 sm:py-32">
      <div className="container-page grid gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="flex flex-col gap-8">
          <SectionHeading
            eyebrow="Kontakt"
            title={
              <>
                Reden wir über den Teil,{" "}
                <span className="text-glacier-gradient">der unter Wasser liegt</span>.
              </>
            }
            description="Erzählen Sie uns kurz von Ihrem Unternehmen und Ihrem Vorhaben. Sie bekommen innerhalb von zwei Werktagen eine ehrliche Ersteinschätzung – kostenlos und ohne Verkaufsgespräch."
          />

          <BlurFade delay={0.2}>
            <div className="flex flex-col gap-3">
              <a
                href={`mailto:${siteConfig.contact.email}`}
                className="group inline-flex items-center gap-3 text-base text-glacier transition-colors hover:text-signal"
              >
                <span className="grid size-10 place-items-center rounded-2xl border border-ice/15 bg-ocean/40 text-signal">
                  <Mail className="size-4" />
                </span>
                {siteConfig.contact.email}
                <ArrowUpRight className="size-4 opacity-0 transition-opacity group-hover:opacity-100" />
              </a>
              <a
                href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
                className="group inline-flex items-center gap-3 text-base text-glacier transition-colors hover:text-signal"
              >
                <span className="grid size-10 place-items-center rounded-2xl border border-ice/15 bg-ocean/40 text-signal">
                  <Phone className="size-4" />
                </span>
                {siteConfig.contact.phone}
              </a>
            </div>
          </BlurFade>
        </div>

        <BlurFade delay={0.1} direction="left">
          <div className="panel-glass relative overflow-hidden rounded-3xl p-6 shadow-panel sm:p-8">
            <BorderBeam duration={11} size={260} />

            {state === "success" ? (
              <div className="flex min-h-80 flex-col items-center justify-center gap-4 text-center">
                <span className="grid size-14 place-items-center rounded-full bg-signal/15 text-signal">
                  <Check className="size-7" />
                </span>
                <h3 className="text-2xl font-semibold text-glacier">
                  Anfrage ist angekommen.
                </h3>
                <p className="max-w-sm text-sm text-steel">
                  Vielen Dank. Wir melden uns innerhalb von zwei Werktagen bei Ihnen.
                </p>
                <Button variant="outline" size="sm" onClick={() => setState("idle")}>
                  Weitere Anfrage senden
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate={false}>
                {/* Honeypot: für Menschen unsichtbar, für Bots verlockend. */}
                <div aria-hidden className="absolute -left-[9999px]">
                  <label htmlFor="website">Website</label>
                  <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Name" name="name" autoComplete="name" required />
                  <Field label="Unternehmen" name="company" autoComplete="organization" required />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="E-Mail" name="email" type="email" autoComplete="email" required />
                  <Field label="Telefon" name="phone" type="tel" autoComplete="tel" />
                </div>

                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-glacier">
                    Ihr Vorhaben <span className="text-signal">*</span>
                  </span>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    minLength={10}
                    placeholder="Relaunch, Konfigurator, Karriereportal – worum geht es?"
                    className={fieldClasses}
                  />
                </label>

                <label className="flex items-start gap-3 text-sm text-steel">
                  <input
                    type="checkbox"
                    name="privacy"
                    required
                    className="mt-0.5 size-4 shrink-0 rounded border-ice/30 bg-deep accent-signal"
                  />
                  <span>
                    Ich habe die{" "}
                    <Link href="/datenschutz" className="text-signal underline underline-offset-4">
                      Datenschutzerklärung
                    </Link>{" "}
                    gelesen und stimme der Verarbeitung meiner Daten zur Bearbeitung der Anfrage zu.
                  </span>
                </label>

                {state === "error" && (
                  <p role="alert" className="text-sm text-forge">
                    {message}
                  </p>
                )}

                <Button type="submit" size="lg" disabled={state === "sending"} className="mt-2">
                  {state === "sending" ? (
                    <>
                      <Loader2 className="animate-spin" />
                      Wird gesendet …
                    </>
                  ) : (
                    <>
                      Anfrage senden
                      <ArrowUpRight />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </BlurFade>
      </div>
    </section>
  );
}

const fieldClasses = cn(
  "w-full rounded-2xl border border-ice/15 bg-deep/60 px-4 py-3 text-sm text-glacier",
  "placeholder:text-steel/60 transition-colors",
  "focus:border-signal/60 focus:outline-none focus:ring-1 focus:ring-signal/40",
);

type FieldProps = {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
};

function Field({ label, name, type = "text", required, autoComplete }: FieldProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-glacier">
        {label} {required && <span className="text-signal">*</span>}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className={fieldClasses}
      />
    </label>
  );
}
