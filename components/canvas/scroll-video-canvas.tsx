"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { scrollProgress } from "@/lib/scroll-progress";
import { scrollMedia, type ScrollMediaSource } from "@/lib/scroll-media";
import { clamp } from "@/lib/utils";
import { paintIcebergFrame } from "./procedural-iceberg";
import { useImageSequence } from "./use-image-sequence";

type ScrollVideoCanvasProps = {
  /** Überschreibt die globale Quelle aus `lib/scroll-media.ts`. */
  source?: ScrollMediaSource;
  className?: string;
};

/**
 * Seitenweiter Scroll-Hintergrund.
 *
 * Ein fixiertes Canvas liegt hinter dem gesamten Seiteninhalt. Ein einziger
 * ScrollTrigger über das komplette Dokument liefert den Fortschritt (0–1); der
 * wird in `scrollProgress` gespiegelt, damit andere Sektionen (z. B. die
 * Eisberg-Story) denselben Wert lesen können, ohne einen zweiten Trigger
 * aufzumachen.
 *
 * Je nach Quelle zeichnet der Frame-Loop:
 *  - `procedural` → die Szene wird berechnet,
 *  - `frames`     → der zum Fortschritt passende vorgeladene Frame,
 *  - `video`      → `currentTime` wird an den Fortschritt gekoppelt und das
 *                   Videobild ins Canvas kopiert.
 *
 * Gezeichnet wird ausschliesslich im GSAP-Ticker, nie direkt im
 * Scroll-Callback: So bleibt es bei maximal einem Repaint pro Frame, auch wenn
 * der Browser mehrere Scroll-Events pro Frame feuert.
 */
export function ScrollVideoCanvas({ source = scrollMedia, className }: ScrollVideoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Ziel- und Ist-Fortschritt: Der Ist-Wert läuft dem Ziel weich hinterher,
  // damit ruckartiges Scrollen (Mausrad, Sprungmarken) nicht durchschlägt.
  const targetRef = useRef(0);
  const currentRef = useRef(0);

  const isFrames = source.kind === "frames";
  const sequence = useImageSequence(
    isFrames ? source.count : 0,
    isFrames ? source.src : fallbackSrc,
  );

  // Video-Metadaten (Dauer) stehen erst nach `loadedmetadata` bereit.
  const durationRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      // DPR deckeln: Ein fullscreen-Canvas bei DPR 3 kostet mehr Fillrate,
      // als der Schärfegewinn wert ist.
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /** Zeichnet ein Bild formatfüllend (`object-fit: cover`). */
    const drawCover = (media: HTMLImageElement | HTMLVideoElement) => {
      const mediaWidth = "naturalWidth" in media ? media.naturalWidth : media.videoWidth;
      const mediaHeight = "naturalHeight" in media ? media.naturalHeight : media.videoHeight;
      if (!mediaWidth || !mediaHeight) return;

      const scale = Math.max(width / mediaWidth, height / mediaHeight);
      const drawWidth = mediaWidth * scale;
      const drawHeight = mediaHeight * scale;
      ctx.drawImage(
        media,
        (width - drawWidth) / 2,
        (height - drawHeight) / 2,
        drawWidth,
        drawHeight,
      );
    };

    const render = (progress: number) => {
      if (source.kind === "procedural") {
        paintIcebergFrame(ctx, width, height, progress);
        return;
      }

      if (source.kind === "frames") {
        const index = Math.round(progress * (source.count - 1));
        // Fehlt der exakte Frame noch, den nächstgelegenen geladenen nehmen –
        // besser ein leicht veralteter Frame als ein schwarzes Bild.
        const frame = nearestFrame(sequence.frames.current, index);
        if (frame) drawCover(frame);
        return;
      }

      const video = videoRef.current;
      if (!video || durationRef.current === 0) return;

      const targetTime = progress * durationRef.current;
      // Nur seeken, wenn es sich lohnt: Jeder Seek stösst eine Dekodierung an.
      if (Math.abs(video.currentTime - targetTime) > 1 / 30) {
        video.currentTime = targetTime;
      }
      if (video.readyState >= 2) drawCover(video);
    };

    const tick = () => {
      // Exponentielle Annäherung – frameratenunabhängig genug für 60–144 Hz.
      currentRef.current += (targetRef.current - currentRef.current) * 0.12;

      // Unter ~0,0002 ist der Unterschied nicht mehr sichtbar; dann Neuzeichnen
      // sparen, statt weiter gegen den Grenzwert zu rechnen.
      if (Math.abs(targetRef.current - currentRef.current) < 0.0002) {
        currentRef.current = targetRef.current;
      }

      render(clamp(currentRef.current));
    };

    resize();

    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        targetRef.current = self.progress;
        scrollProgress.set(self.progress);
      },
      onRefresh: (self) => {
        targetRef.current = self.progress;
        currentRef.current = self.progress;
        scrollProgress.set(self.progress);
      },
    });

    gsap.ticker.add(tick);
    window.addEventListener("resize", resize);
    window.addEventListener("orientationchange", resize);

    return () => {
      gsap.ticker.remove(tick);
      trigger.kill();
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
    };
  }, [source, sequence.frames, sequence.ready]);

  return (
    <div
      aria-hidden
      className={
        className ??
        "pointer-events-none fixed inset-0 -z-10 h-screen w-screen overflow-hidden bg-abyss"
      }
    >
      <canvas ref={canvasRef} className="h-full w-full" />

      {source.kind === "video" && (
        // Das Video ist nur Datenquelle für `drawImage`; sichtbar ist das Canvas.
        <video
          ref={videoRef}
          src={source.src}
          poster={source.poster}
          muted
          playsInline
          preload="auto"
          // `crossOrigin` erlaubt später Pixel-Effekte auf dem Canvas.
          crossOrigin="anonymous"
          className="pointer-events-none absolute h-px w-px opacity-0"
          onLoadedMetadata={(event) => {
            const video = event.currentTarget;
            // Ein kurzer Play/Pause-Zyklus zwingt Safari, den Dekoder zu
            // initialisieren – sonst bleibt der erste Seek schwarz.
            void video.play().then(() => video.pause()).catch(() => {});
            durationRef.current = video.duration;
          }}
        />
      )}
    </div>
  );
}

/** Platzhalter, damit `useImageSequence` auch bei inaktiver Quelle stabil bleibt. */
function fallbackSrc(index: number) {
  return `/sequence/frames/${index}.webp`;
}

/** Nächstgelegener bereits geladener Frame zum gewünschten Index. */
function nearestFrame(
  frames: Array<HTMLImageElement | undefined>,
  index: number,
): HTMLImageElement | undefined {
  if (frames[index]) return frames[index];

  for (let offset = 1; offset < frames.length; offset++) {
    const before = frames[index - offset];
    if (before) return before;
    const after = frames[index + offset];
    if (after) return after;
  }
  return undefined;
}
