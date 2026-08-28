"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

export type ImageSequence = {
  /**
   * Geladene Frames; Lücken sind `undefined`, solange noch geladen wird.
   *
   * Bewusst als Ref und nicht als Array: Der Inhalt ändert sich hunderte Male
   * während des Ladens, soll aber kein Re-Rendering auslösen. Gelesen wird er
   * ausschliesslich im Render-Loop des Canvas – also ausserhalb des Renderings.
   */
  frames: RefObject<Array<HTMLImageElement | undefined>>;
  /** Anteil bereits geladener Frames (0–1). */
  progress: number;
  /** `true`, sobald genug Frames für ein flüssiges Scrubbing da sind. */
  ready: boolean;
};

/**
 * Lädt eine Bildsequenz für das Scroll-Scrubbing vor.
 *
 * Zwei Durchgänge, damit die Seite nicht auf den kompletten Download wartet:
 *  1. jeder achte Frame – reicht für ein grobes, sofort sichtbares Scrubbing,
 *  2. alle übrigen Frames im Hintergrund, mit begrenzter Parallelität, damit
 *     die Verbindung nicht mit hunderten gleichzeitigen Requests blockiert.
 *
 * @param count  Anzahl Frames; `0` deaktiviert den Hook vollständig.
 * @param src    Pfad-Builder für den Frame-Index.
 */
export function useImageSequence(count: number, src: (index: number) => string): ImageSequence {
  const framesRef = useRef<Array<HTMLImageElement | undefined>>([]);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(count === 0);

  useEffect(() => {
    if (count === 0) return;

    framesRef.current = new Array(count).fill(undefined);
    let cancelled = false;
    let loaded = 0;

    const load = (index: number) =>
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = "async";
        img.src = src(index);

        const done = () => {
          if (cancelled) return resolve();
          framesRef.current[index] = img;
          loaded += 1;
          setProgress(loaded / count);
          resolve();
        };

        img.onload = done;
        // Fehlende Frames dürfen die Sequenz nicht blockieren – der Renderer
        // greift dann auf den letzten vorhandenen Frame zurück.
        img.onerror = () => {
          loaded += 1;
          setProgress(loaded / count);
          resolve();
        };
      });

    const runPool = async (indices: number[], concurrency: number) => {
      let cursor = 0;
      const workers = Array.from({ length: Math.min(concurrency, indices.length) }, async () => {
        while (cursor < indices.length && !cancelled) {
          const index = indices[cursor++];
          await load(index);
        }
      });
      await Promise.all(workers);
    };

    const all = Array.from({ length: count }, (_, i) => i);
    const keyframes = all.filter((i) => i % 8 === 0);
    const rest = all.filter((i) => i % 8 !== 0);

    (async () => {
      await runPool(keyframes, 6);
      if (cancelled) return;
      setReady(true);
      await runPool(rest, 8);
    })();

    return () => {
      cancelled = true;
    };
  }, [count, src]);

  return { frames: framesRef, progress, ready };
}
