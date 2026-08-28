"use client";

import { ArrowUpRight } from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";
import { GridPattern } from "@/components/ui/grid-pattern";
import { PulseCta } from "@/components/ui/pulse-cta";
import { scrollToTarget } from "@/lib/smooth-scroll";

/** Breites Handlungsband zwischen Leistungen und Referenzen. */
export function CtaBand() {
  return (
    <section className="relative z-10 py-16 sm:py-24">
      <div className="container-page">
        <div className="panel-glass relative overflow-hidden rounded-[2rem] px-6 py-14 text-center shadow-panel sm:px-12">
          <GridPattern
            width={40}
            height={40}
            className="[mask-image:radial-gradient(60%_60%_at_50%_50%,#000,transparent)]"
          />

          <div className="relative flex flex-col items-center gap-6">
            <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight text-glacier sm:text-5xl">
              Bereit, den ganzen Eisberg zu heben?
            </h2>
            <p className="max-w-xl text-pretty text-base leading-relaxed text-steel sm:text-lg">
              Ein Gespräch, eine ehrliche Einschätzung, ein klarer nächster Schritt.
              Ohne Agentur-Floskeln.
            </p>

            <PulseCta
              href="#kontakt"
              onClick={(event) => {
                event.preventDefault();
                scrollToTarget("#kontakt");
              }}
            >
              Jetzt Kontakt aufnehmen
              <ArrowUpRight className="size-4" />
            </PulseCta>
          </div>

          <BorderBeam duration={12} size={320} />
        </div>
      </div>
    </section>
  );
}
