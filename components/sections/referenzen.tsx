import { Trophy } from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { Marquee } from "@/components/ui/marquee";
import { SectionHeading } from "@/components/ui/section-heading";
import { references } from "@/lib/site-config";

/**
 * „Hall of Fame“ – Referenzprojekte als endlos laufendes Band.
 *
 * Aktuell mit Platzhalterdaten aus `site-config.ts`; sobald Kundenfreigaben
 * vorliegen, werden dort Logo-Pfade und echte Kennzahlen ergänzt.
 */
export function Referenzen() {
  return (
    <section
      id="referenzen"
      className="relative z-10 overflow-hidden bg-abyss/85 py-24 backdrop-blur-xl sm:py-32"
    >
      <div className="container-page">
        <SectionHeading
          align="center"
          eyebrow="Hall of Fame"
          title={
            <>
              Projekte, die <span className="text-glacier-gradient">Zahlen bewegt</span> haben
            </>
          }
          description="Ein Auszug aus Relaunches, Portalen und Konfiguratoren für produzierende Unternehmen."
        />
      </div>

      <BlurFade delay={0.1} className="mt-14">
        <Marquee duration="52s" pauseOnHover gap="1rem">
          {references.map((reference) => (
            <article
              key={reference.id}
              className="panel-glass flex w-[19rem] shrink-0 flex-col gap-4 rounded-3xl p-6"
            >
              <span
                aria-hidden
                className="grid size-10 place-items-center rounded-2xl border border-ice/15 bg-ocean/40 text-signal"
              >
                <Trophy className="size-4" />
              </span>

              <div className="flex flex-col gap-1">
                <h3 className="text-base font-semibold tracking-tight text-glacier">
                  {reference.client}
                </h3>
                <p className="text-sm text-steel">{reference.project}</p>
              </div>

              <p className="mt-auto text-xl font-semibold tracking-tight text-signal">
                {reference.result}
              </p>
            </article>
          ))}
        </Marquee>
      </BlurFade>

      {/* Weiche Kanten */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-linear-to-r from-abyss to-transparent"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-linear-to-l from-abyss to-transparent"
      />
    </section>
  );
}
