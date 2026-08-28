"use client";

import { useRef } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { useGsapScroll } from "@/hooks/use-gsap-scroll";
import { HeroDiamond } from "@/components/canvas/hero-diamond";
import { AnimatedShinyText } from "@/components/ui/animated-shiny-text";
import { Button } from "@/components/ui/button";
import { Marquee } from "@/components/ui/marquee";
import { industries, siteConfig } from "@/lib/site-config";
import { scrollToTarget } from "@/lib/smooth-scroll";

/**
 * Hero-Sektion: Firmenname mit Diamant, darunter die Branchen als Laufband.
 *
 * Der Eisberg dahinter kommt aus dem seitenweiten Canvas-Hintergrund – diese
 * Sektion ist bewusst transparent, damit die Kamerafahrt durchscheint.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);

  useGsapScroll(
    (_ctx, scope) => {
      // Auftritt: gestaffelt von oben nach unten.
      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .from(scope.querySelectorAll("[data-hero-reveal]"), {
          y: 34,
          autoAlpha: 0,
          filter: "blur(10px)",
          duration: 1,
          stagger: 0.12,
        })
        .from("[data-hero-diamond]", { scale: 0.82, autoAlpha: 0, duration: 1.2 }, 0.2);

      // Sanfte Parallaxe: Der Hero-Inhalt zieht beim Scrollen leicht nach oben
      // weg, während der Hintergrund stehen bleibt – das erzeugt Tiefe.
      gsap.to("[data-hero-parallax]", {
        y: -90,
        autoAlpha: 0,
        ease: "none",
        scrollTrigger: {
          trigger: scope,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    },
    root,
  );

  return (
    <section
      ref={root}
      id="start"
      className="relative flex min-h-screen flex-col justify-center pt-28 pb-12"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-linear-to-r from-abyss/85 via-abyss/40 to-transparent"
      />

      <div className="container-page relative" data-hero-parallax>
        <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col items-start gap-6">
            <span
              data-hero-reveal
              className="inline-flex items-center gap-2 rounded-full border border-ice/20 bg-deep/50 px-4 py-1.5 text-xs font-medium backdrop-blur-md"
            >
              <span aria-hidden className="size-1.5 rounded-full bg-signal shadow-glow" />
              <AnimatedShinyText>{siteConfig.tagline}</AnimatedShinyText>
            </span>

            <h1
              data-hero-reveal
              className="font-display text-balance text-5xl font-semibold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl"
            >
              <span className="text-glacier-gradient">Pixel</span>{" "}
              <span className="text-glacier">Werk</span>
            </h1>

            <p
              data-hero-reveal
              className="max-w-xl text-pretty text-lg leading-relaxed text-steel sm:text-xl"
            >
              Wir bauen digitale Auftritte für{" "}
              <strong className="font-semibold text-glacier">
                Industrie, Maschinenbau, Stahl- und Metallbau
              </strong>
              . Technisch präzise, messbar schnell – und darauf gebaut, Anfragen
              zu erzeugen statt Klicks zu zählen.
            </p>

            <div data-hero-reveal className="flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={() => scrollToTarget("#kontakt")}
                aria-label="Zum Kontaktformular"
              >
                Projekt besprechen
                <ArrowUpRight />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => scrollToTarget("#leistungen")}
              >
                Leistungen ansehen
              </Button>
            </div>
          </div>

          <div data-hero-diamond className="mx-auto w-full max-w-sm lg:max-w-none">
            <HeroDiamond />
          </div>
        </div>
      </div>

      {/* Branchen-Laufband */}
      <div
        data-hero-reveal
        className="relative mt-16 overflow-hidden border-y border-ice/10 bg-deep/30 py-3 backdrop-blur-sm"
      >
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

      {/* Scroll-Hinweis */}
      <button
        type="button"
        onClick={() => scrollToTarget("#eisberg")}
        data-hero-reveal
        className="mx-auto mt-10 flex flex-col items-center gap-2 text-xs uppercase tracking-[0.25em] text-steel transition-colors hover:text-signal"
      >
        Scrollen
        <ArrowDown className="size-4 animate-bounce" />
      </button>
    </section>
  );
}
