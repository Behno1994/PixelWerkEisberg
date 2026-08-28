import {
  Box,
  Gauge,
  LayoutTemplate,
  Search,
  SlidersHorizontal,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { BlurFade } from "@/components/ui/blur-fade";
import { BorderBeam } from "@/components/ui/border-beam";
import { GridPattern } from "@/components/ui/grid-pattern";
import { SectionHeading } from "@/components/ui/section-heading";
import { services } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/**
 * Icon-Auflösung.
 *
 * `site-config.ts` speichert nur den Namen, damit die Inhaltsdatei frei von
 * React-Imports bleibt. Eine explizite Map statt eines dynamischen Zugriffs auf
 * das Lucide-Paket – so landen nur die tatsächlich genutzten Icons im Bundle.
 */
const icons: Record<string, LucideIcon> = {
  LayoutTemplate,
  SlidersHorizontal,
  Workflow,
  Search,
  Users,
  Box,
  Gauge,
};

export function Leistungen() {
  return (
    <section id="leistungen" className="relative z-10 bg-abyss/85 py-24 backdrop-blur-xl sm:py-32">
      <GridPattern
        width={64}
        height={64}
        className="[mask-image:radial-gradient(70%_60%_at_50%_0%,#000,transparent)]"
      />

      <div className="container-page relative">
        <SectionHeading
          eyebrow="Leistungen"
          title={
            <>
              Was unter der Oberfläche{" "}
              <span className="text-glacier-gradient">tatsächlich arbeitet</span>
            </>
          }
          description="Von der Corporate Site bis zur ERP-Anbindung: Wir bauen die Ebenen, die aus einem Webauftritt ein Vertriebswerkzeug machen."
        />

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const Icon = icons[service.icon] ?? LayoutTemplate;

            return (
              <BlurFade
                key={service.id}
                delay={index * 0.06}
                className={cn(service.featured && "sm:col-span-2")}
              >
                <article
                  className={cn(
                    "group relative h-full overflow-hidden rounded-3xl p-6",
                    "panel-glass transition-colors duration-500",
                    "hover:border-signal/40",
                  )}
                >
                  <div className="flex items-start gap-4">
                    <span
                      aria-hidden
                      className={cn(
                        "grid size-11 shrink-0 place-items-center rounded-2xl",
                        "border border-ice/15 bg-ocean/40 text-signal",
                        "transition-colors duration-500 group-hover:bg-signal group-hover:text-abyss",
                      )}
                    >
                      <Icon className="size-5" />
                    </span>

                    <div className="flex flex-col gap-2">
                      <h3 className="font-display text-lg font-semibold tracking-tight text-glacier">
                        {service.title}
                      </h3>
                      <p className="text-pretty text-sm leading-relaxed text-steel">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  {service.featured && <BorderBeam duration={9} size={180} />}
                </article>
              </BlurFade>
            );
          })}
        </div>
      </div>
    </section>
  );
}
