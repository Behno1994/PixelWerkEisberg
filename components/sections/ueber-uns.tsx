import { BlurFade } from "@/components/ui/blur-fade";
import { NumberTicker } from "@/components/ui/number-ticker";
import { SectionHeading } from "@/components/ui/section-heading";
import { stats } from "@/lib/site-config";

export function UeberUns() {
  return (
    <section id="ueber-uns" className="relative z-10 py-24 sm:py-32">
      <div className="container-page grid gap-14 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <SectionHeading
          eyebrow="Über uns"
          title={
            <>
              Wir kennen den Unterschied zwischen{" "}
              <span className="text-glacier-gradient">schön</span> und{" "}
              <span className="text-glacier-gradient">verkauft</span>.
            </>
          }
          description="Pixel Werk ist auf einen Markt spezialisiert, den die meisten Agenturen nur streifen: technische Produkte mit langen Entscheidungswegen, erklärungsbedürftigen Varianten und Einkäufern, die Datenblätter lesen statt Slogans. Wir übersetzen Fertigungstiefe in digitale Substanz – und messen unsere Arbeit an Anfragen, nicht an Applaus."
        />

        <BlurFade delay={0.15} direction="left">
          <dl className="grid grid-cols-2 gap-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="panel-glass flex flex-col gap-1 rounded-3xl p-6"
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-4xl font-semibold tracking-tight text-glacier">
                  <NumberTicker value={stat.value} />
                  <span className="text-signal">{stat.suffix}</span>
                </dd>
                <p aria-hidden className="text-sm leading-snug text-steel">
                  {stat.label}
                </p>
              </div>
            ))}
          </dl>
        </BlurFade>
      </div>
    </section>
  );
}
