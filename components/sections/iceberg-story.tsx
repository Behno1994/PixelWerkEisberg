"use client";

import { useRef } from "react";
import { gsap } from "@/lib/gsap";
import { useGsapScroll, useScrollProgress } from "@/hooks/use-gsap-scroll";
import { useReducedMotion } from "@/hooks/use-media-query";
import { Particles } from "@/components/ui/particles";
import { storyBeats } from "@/lib/site-config";
import { cn } from "@/lib/utils";

/** Maximale Anzeigetiefe der Tiefenskala in Metern (rein gestalterisch). */
const MAX_DEPTH = 340;

/**
 * Eisberg-Scrollytelling.
 *
 * Die Sektion ist bewusst überhoch (ein Viewport pro Beat). Ihr Inhalt klebt
 * per `position: sticky` im Bild, während der Scroll die Timeline abspielt –
 * dadurch scheint der Text vor dem durchlaufenden Hintergrund-Canvas zu
 * schweben, ohne dass hier ein eigenes Pinning nötig wäre (GSAP-Pinning würde
 * mit Lenis zusätzliche Layout-Berechnungen erzwingen).
 *
 * Jeder Beat blendet in seinem eigenen Fortschrittsfenster ein und wieder aus.
 * Die Fenster überlappen leicht, sodass ein Cross-Fade entsteht statt eines
 * harten Schnitts.
 */
export function IcebergStory() {
  const root = useRef<HTMLElement>(null);
  const depthValueRef = useRef<HTMLSpanElement>(null);
  const depthFillRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useGsapScroll(
    (_ctx, scope) => {
      if (reducedMotion) {
        // Ohne Bewegung: alles sichtbar, kein Scrub.
        gsap.set("[data-beat]", { autoAlpha: 1, y: 0, filter: "none" });
        return;
      }

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: scope,
          start: "top top",
          end: "bottom bottom",
          // Leichte Verzögerung: Text kommt einen Tick nach dem Bild – wirkt
          // ruhiger als eine 1:1-Kopplung.
          scrub: 0.6,
        },
      });

      for (const beat of storyBeats) {
        const element = scope.querySelector<HTMLElement>(`#${beat.id}`);
        if (!element) continue;

        const window_ = beat.end - beat.start;
        const fade = Math.min(0.09, window_ * 0.4);
        const isLast = beat === storyBeats[storyBeats.length - 1];

        timeline.fromTo(
          element,
          { autoAlpha: 0, y: 46, filter: "blur(14px)" },
          { autoAlpha: 1, y: 0, filter: "blur(0px)", duration: fade },
          beat.start,
        );

        // Der letzte Beat bleibt stehen – sonst endet die Story im Nichts.
        if (!isLast) {
          timeline.to(
            element,
            { autoAlpha: 0, y: -46, filter: "blur(14px)", duration: fade },
            beat.end - fade,
          );
        }
      }

    },
    root,
    [reducedMotion],
  );

  // Tiefenskala am rechten Rand – eigener Trigger, weil sie auch bei
  // reduzierter Bewegung mitlaufen darf (sie bewegt nichts, sie zeigt an).
  useScrollProgress(root, (progress) => {
    if (depthValueRef.current) {
      depthValueRef.current.textContent = String(Math.round(progress * MAX_DEPTH));
    }
    if (depthFillRef.current) {
      depthFillRef.current.style.transform = `scaleY(${progress})`;
    }
  });

  return (
    <section
      ref={root}
      id="eisberg"
      aria-label="Warum eine Webseite nur die Spitze des Eisbergs ist"
      className={cn(
        "relative z-10",
        // Ein Viewport Scrollweg pro Beat, plus etwas Auslauf.
        "h-[560vh] motion-reduce:h-auto",
      )}
    >
      <div
        className={cn(
          "sticky top-0 flex h-screen items-center overflow-hidden",
          "motion-reduce:static motion-reduce:h-auto motion-reduce:block motion-reduce:py-24",
        )}
      >
        {/* Abdunkler von links: garantiert Textkontrast, auch wenn der
            Hintergrund später gegen ein Video oder eine Bildsequenz getauscht
            wird und dessen Helligkeit nicht vorhersehbar ist. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-r from-abyss/90 via-abyss/50 to-transparent"
        />

        {/* Aufsteigende Luftblasen */}
        <Particles className="absolute inset-0" quantity={90} speed={0.32} />

        <div className="container-page relative w-full">
          <div
            className={cn(
              "relative min-h-[26rem]",
              "motion-reduce:min-h-0 motion-reduce:space-y-20",
            )}
          >
            {storyBeats.map((beat) => (
              <article
                key={beat.id}
                id={beat.id}
                data-beat
                className={cn(
                  "absolute inset-x-0 top-1/2 max-w-3xl -translate-y-1/2",
                  "motion-reduce:static motion-reduce:translate-y-0",
                  // Vor dem GSAP-Setup unsichtbar – verhindert, dass beim
                  // ersten Paint alle Beats gleichzeitig aufblitzen.
                  "opacity-0 motion-reduce:opacity-100",
                )}
              >
                {beat.kicker && (
                  <p className="mb-4 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.24em] text-signal">
                    <span aria-hidden className="h-px w-8 bg-signal/60" />
                    {beat.kicker}
                  </p>
                )}

                <h2
                  className={cn(
                    "font-display text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl",
                    beat.depth === "surface"
                      ? "text-white drop-shadow-[0_2px_30px_rgba(2,10,22,0.85)]"
                      : "text-glacier drop-shadow-[0_2px_30px_rgba(2,10,22,0.95)]",
                  )}
                >
                  {renderEmphasis(beat.line, beat.emphasis)}
                </h2>

                {beat.body && (
                  <p className="mt-6 max-w-xl text-pretty text-base leading-relaxed text-ice/85 sm:text-lg">
                    {beat.body}
                  </p>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* Tiefenskala */}
        <div
          aria-hidden
          className="absolute right-6 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex motion-reduce:hidden"
        >
          <span className="text-[10px] uppercase tracking-[0.2em] text-steel">Tiefe</span>
          <div className="relative h-40 w-px overflow-hidden bg-ice/15">
            <div
              ref={depthFillRef}
              className="absolute inset-x-0 top-0 h-full origin-top bg-signal"
              style={{ transform: "scaleY(0)" }}
            />
          </div>
          <span className="font-mono text-xs tabular-nums text-ice/80">
            <span ref={depthValueRef}>0</span> m
          </span>
        </div>
      </div>
    </section>
  );
}

/**
 * Hebt `emphasis` innerhalb von `line` farblich hervor.
 * Kommt der Teilstring nicht vor, wird die Zeile unverändert ausgegeben.
 */
function renderEmphasis(line: string, emphasis?: string) {
  if (!emphasis) return line;

  const index = line.indexOf(emphasis);
  if (index === -1) return line;

  return (
    <>
      {line.slice(0, index)}
      <span className="text-glacier-gradient">{emphasis}</span>
      {line.slice(index + emphasis.length)}
    </>
  );
}
