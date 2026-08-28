"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { Stagger } from "@/components/ui/stagger";
import { useVideoScrub, type VideoScrubMode } from "@/hooks/use-video-scrub";
import { sceneProgress } from "@/lib/scroll-progress";
import { sceneVideo } from "@/lib/scroll-media";
import { scrollToTarget } from "@/lib/smooth-scroll";
import { clamp, cn } from "@/lib/utils";
import { paintIcebergFrame } from "./procedural-iceberg";

/** Dämpfung der Annäherung an die Zielposition (grösser = strafferer Lauf). */
const LERP_TAU = 8;
/** Abstand, ab dem die Zielposition als erreicht gilt. */
const SNAP = 0.002;
/** Fortschritt, ab dem das Bild dunkel ist und die Schrift auf Weiss wechselt. */
export const LIGHT_TO_DARK = 0.55;

/**
 * Deckkraft der drei Textstufen.
 *
 * Streng sequentiell: Eine Stufe ist vollständig ausgeblendet, bevor die
 * nächste erscheint. Die Zahlen sind Fortschrittsmarken innerhalb der Szene.
 */
function stageOpacities(p: number) {
  // Stufe 1: steht ab Beginn, blendet zwischen 0.20 und 0.28 aus.
  const one = p < 0.2 ? 1 : Math.max(0, 1 - (p - 0.2) / 0.08);

  // Stufe 2: 0.32–0.40 ein, hält bis 0.55, 0.55–0.63 aus.
  let two: number;
  if (p < 0.32) two = 0;
  else if (p < 0.4) two = (p - 0.32) / 0.08;
  else if (p < 0.55) two = 1;
  else two = Math.max(0, 1 - (p - 0.55) / 0.08);

  // Stufe 3: 0.67–0.75 ein, bleibt bis zum Ende stehen.
  let three: number;
  if (p < 0.67) three = 0;
  else if (p < 0.75) three = (p - 0.67) / 0.08;
  else three = 1;

  return [one, two, three] as const;
}

/**
 * Die durchgehende Kino-Szene der Startseite.
 *
 * Aufbau: Ein 500vh hoher Scrolltrack gibt die Scrollstrecke vor, sein Inhalt
 * klebt per `sticky` bildfüllend im Viewport. Darin liegen drei Ebenen:
 *
 *  1. `<video>` – Rückfallebene, sichtbar nur wenn das Canvas keine Frames hat,
 *  2. `<canvas>` – zeichnet dekodierte Frames (oder die prozedurale Szene),
 *  3. Overlay – die drei Textstufen, durchklickbar nur wo nötig.
 *
 * Das Video wird nie als Zeitleiste abgespielt; seine Position hängt
 * ausschliesslich am Scroll (siehe `useVideoScrub`).
 */
export function CinematicScene() {
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const progressRef = useRef(0);

  const [mode, setMode] = useState<VideoScrubMode>("idle");
  // Grobe Zustände: ändern sich ein paar Mal pro Seite, nicht pro Frame.
  const [activeStage, setActiveStage] = useState(0);
  const [onDarkFrame, setOnDarkFrame] = useState(false);

  const { videoRef, canvasRef } = useVideoScrub({
    src: sceneVideo?.src,
    getProgress: () => progressRef.current,
    onModeChange: setMode,
  });

  useEffect(() => {
    const track = trackRef.current;
    const canvas = canvasRef.current;
    if (!track) return;

    // Ohne Videoquelle malt die prozedurale Szene direkt auf dasselbe Canvas.
    const ctx = sceneVideo ? null : canvas?.getContext("2d", { alpha: false });

    let rafId = 0;
    let lastTime = performance.now();
    let damped = 0;
    let visible = true;
    let span = 1;
    // Letzte an React gemeldete Werte – verhindert Updates ohne Änderung.
    let lastStage = -2;
    let lastDark = false;

    const measure = () => {
      // Der Track ist das erste Element der Seite; `offsetTop` macht die
      // Rechnung dennoch unabhängig davon, ob später etwas darüber landet.
      span = Math.max(1, track.offsetHeight - window.innerHeight);
    };

    const readProgress = () => {
      const scrolled = window.scrollY - track.offsetTop;
      return clamp(scrolled / span);
    };

    const tick = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const target = readProgress();
      progressRef.current = target;
      sceneProgress.set(target);

      // Frameraten-unabhängige exponentielle Annäherung.
      damped += (target - damped) * (1 - Math.exp(-LERP_TAU * delta));
      if (Math.abs(target - damped) < SNAP) damped = target;

      if (ctx && canvas) {
        paintIcebergFrame(ctx, canvas.width, canvas.height, damped);
      }

      const [one, two, three] = stageOpacities(target);
      const opacities = [one, two, three];
      for (const [index, opacity] of opacities.entries()) {
        const element = stageRefs.current[index];
        if (element) element.style.opacity = String(opacity);
      }

      // Stufe gilt als aktiv, sobald sie deutlich sichtbar ist – das steuert
      // den gestaffelten Auftritt der Kindelemente.
      const next = opacities.findIndex((opacity) => opacity > 0.3);
      if (next !== lastStage) {
        lastStage = next;
        setActiveStage(next);
      }

      const dark = target > LIGHT_TO_DARK;
      if (dark !== lastDark) {
        lastDark = dark;
        setOnDarkFrame(dark);
      }

      rafId = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && rafId === 0) {
          lastTime = performance.now();
          rafId = requestAnimationFrame(tick);
        } else if (!visible && rafId !== 0) {
          cancelAnimationFrame(rafId);
          rafId = 0;
        }
      },
      { rootMargin: "100px" },
    );

    measure();
    observer.observe(track);
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    rafId = requestAnimationFrame(tick);

    return () => {
      if (rafId !== 0) cancelAnimationFrame(rafId);
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
    };
  }, [canvasRef]);

  // Das Canvas führt, sobald es etwas zu zeigen hat: dekodierte Frames oder
  // die prozedurale Szene. Nur im Seek-Fallback scheint das Video durch.
  const canvasLive = !sceneVideo || mode === "webcodecs";

  return (
    <div ref={trackRef} id="start" className="relative h-[500vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-abyss">
        {sceneVideo && (
          <video
            ref={videoRef}
            src={sceneVideo.src}
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}

        <canvas
          ref={canvasRef}
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300"
          style={{ opacity: canvasLive ? 1 : 0 }}
        />

        <div className="pointer-events-none absolute inset-0">
          <StageOne ref={(el) => { stageRefs.current[0] = el; }} active={activeStage === 0} />
          <StageTwo ref={(el) => { stageRefs.current[1] = el; }} active={activeStage === 1} />
          <StageThree
            ref={(el) => { stageRefs.current[2] = el; }}
            active={activeStage === 2}
            onDarkFrame={onDarkFrame}
          />
        </div>
      </div>
    </div>
  );
}

type StageProps = {
  ref: React.Ref<HTMLDivElement>;
  active: boolean;
};

/**
 * Gemeinsame Grundeigenschaften jeder Stufe.
 *
 * `opacity` steht bewusst NICHT im style-Prop, sondern wird ausschliesslich
 * vom rAF-Loop imperativ gesetzt: Stünde sie dort, würde React sie bei jedem
 * Re-Render auf den Ausgangswert zurücksetzen und die Stufe kurz aufblitzen.
 * Der Startwert kommt daher aus der Klasse und wird vom Inline-Wert überstimmt.
 */
const stageClasses = "absolute inset-0 opacity-0";
const stageStyle: React.CSSProperties = { transition: "opacity 0.1s ease-out" };

/** Stufe 1 – der Einstieg über hellem Bild. */
function StageOne({ ref, active }: StageProps) {
  return (
    <div
      ref={ref}
      className={cn(stageClasses, "flex flex-col justify-center px-6 sm:px-8 md:px-20 lg:px-32")}
      style={stageStyle}
    >
      <div className="max-w-5xl">
        <Stagger visible={active}>
          <h1 className="font-bold uppercase leading-[1.1] tracking-tight text-slate-900 text-[clamp(2.5rem,6vw,5.5rem)]">
            Webseite um digital gesehen zu werden…
          </h1>
        </Stagger>

        <Stagger visible={active} delay={150} className="mt-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-700">
            Webdesign &amp; Digitalisierung für Maschinenbau, Stahlbau &amp; Industrie
          </p>
        </Stagger>
      </div>

      <Stagger
        visible={active}
        delay={300}
        className="pointer-events-auto absolute bottom-10 right-6 sm:right-8 md:right-20 lg:right-32"
      >
        <span className="grid size-12 place-items-center rounded-full border border-slate-900/25 text-slate-900 backdrop-blur-sm">
          <ArrowRight className="size-5" />
        </span>
      </Stagger>
    </div>
  );
}

/** Stufe 2 – die Eisberg-Metapher, zentriert. */
function StageTwo({ ref, active }: StageProps) {
  return (
    <div
      ref={ref}
      className={cn(stageClasses, "flex flex-col items-center justify-center px-6 sm:px-8")}
      style={stageStyle}
    >
      <div className="mx-auto flex max-w-[1000px] flex-col items-center text-center">
        <Stagger visible={active}>
          <h2 className="font-extralight uppercase leading-[1.2] tracking-wide text-slate-900 text-[clamp(2rem,5vw,4.5rem)]">
            …ist nur die Spitze des Eisbergs.
          </h2>
        </Stagger>

        <Stagger visible={active} delay={200} className="mt-6 max-w-2xl">
          <p className="text-base font-normal leading-relaxed text-slate-700">
            Darunter liegen maßgeschneiderte Systemarchitektur, 3D-Visualisierungen,
            Höchstleistung in der Ladezeit und digitale Kunden-Gewinnung für den
            Mittelstand.
          </p>
        </Stagger>
      </div>

      <Stagger
        visible={active}
        delay={350}
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
      >
        <div className="flex flex-col items-center gap-4">
          <span className="grid size-12 place-items-center rounded-full border border-slate-900/25 text-slate-900 backdrop-blur-sm">
            <ArrowDown className="size-5" />
          </span>
          <div className="flex items-center gap-2">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                aria-hidden
                className="size-1.5 animate-dot rounded-full bg-slate-900"
                style={{ animationDelay: `${index * 0.3}s` }}
              />
            ))}
          </div>
        </div>
      </Stagger>
    </div>
  );
}

/** Stufe 3 – Finale und Handlungsaufforderung über dunklem Bild. */
function StageThree({ ref, active, onDarkFrame }: StageProps & { onDarkFrame: boolean }) {
  return (
    <div
      ref={ref}
      className={cn(
        stageClasses,
        "flex items-center justify-between px-6 sm:px-8 md:px-20 lg:px-32",
      )}
      style={stageStyle}
    >
      <div className="max-w-3xl text-left">
        <Stagger visible={active}>
          <p className="mb-4 font-mono text-sm uppercase tracking-[0.3em] text-cyan-400">
            Pixel Werk | Digital Engineering
          </p>
        </Stagger>

        <Stagger visible={active} delay={150}>
          <h2
            className={cn(
              "mb-8 font-light uppercase leading-[1.15] tracking-wide text-[clamp(2.2rem,4.5vw,4.2rem)]",
              onDarkFrame ? "text-white" : "text-slate-900",
            )}
          >
            Wir bringen Ihre Industrie-Exzellenz ins digitale Zeitalter.
          </h2>
        </Stagger>

        <Stagger visible={active} delay={300}>
          <div className="pointer-events-auto flex items-center gap-4">
            <button
              type="button"
              onClick={() => scrollToTarget("#kontakt")}
              className={cn(
                "text-sm uppercase tracking-[0.2em] transition-opacity hover:opacity-70",
                onDarkFrame ? "text-white" : "text-slate-900",
              )}
            >
              Jetzt Projekt starten
            </button>
            <button
              type="button"
              onClick={() => scrollToTarget("#kontakt")}
              aria-label="Jetzt Projekt starten"
              className="grid size-12 place-items-center rounded-full bg-white text-abyss transition-transform duration-300 hover:scale-110 hover:bg-signal"
            >
              <ArrowRight className="size-5" />
            </button>
          </div>
        </Stagger>
      </div>
    </div>
  );
}
