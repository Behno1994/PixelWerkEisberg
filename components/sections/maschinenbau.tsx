import { BlurFade } from "@/components/ui/blur-fade";
import { Marquee } from "@/components/ui/marquee";
import { SectionHeading } from "@/components/ui/section-heading";
import { industries } from "@/lib/site-config";

/**
 * Branchenband: Für wen Pixel Werk arbeitet.
 *
 * Sitzt bewusst direkt hinter der Kino-Szene – nach dem Bild kommt die
 * Einordnung, bevor es zu den Leistungen geht.
 */
export function Maschinenbau() {
  return (
    <section id="maschinenbau" className="relative z-10 overflow-hidden py-24 sm:py-32">
      <div className="container-page">
        <SectionHeading
          eyebrow="Maschinenbau & Industrie"
          title={
            <>
              Wir sprechen die Sprache Ihrer{" "}
              <span className="text-glacier-gradient">Fertigung</span>.
            </>
          }
          description="Technische Produkte mit langen Entscheidungswegen, erklärungsbedürftigen Varianten und Einkäufern, die Datenblätter lesen statt Slogans. Genau dafür bauen wir."
        />
      </div>

      <BlurFade delay={0.1} className="mt-14">
        <div className="relative border-y border-white/10 bg-deep/40 py-4">
          <Marquee duration="48s" pauseOnHover>
            {industries.map((industry) => (
              <span
                key={industry}
                className="flex items-center gap-3 whitespace-nowrap text-sm font-medium uppercase tracking-[0.18em] text-steel"
              >
                <span aria-hidden className="size-1 rotate-45 bg-signal/70" />
                {industry}
              </span>
            ))}
          </Marquee>

          {/* Weiche Kanten links/rechts */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-abyss to-transparent"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-abyss to-transparent"
          />
        </div>
      </BlurFade>
    </section>
  );
}
