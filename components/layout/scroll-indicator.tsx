"use client";

import { useEffect, useRef } from "react";
import { scrollProgress } from "@/lib/scroll-progress";

/**
 * Dünner Fortschrittsbalken am oberen Rand.
 *
 * Liest den Wert aus dem `scrollProgress`-Store, den der Hintergrund-Canvas
 * ohnehin befüllt – dadurch entsteht kein zweiter ScrollTrigger und der
 * Balken läuft exakt synchron zur Kamerafahrt.
 */
export function ScrollIndicator() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      scrollProgress.subscribe((progress) => {
        if (barRef.current) {
          barRef.current.style.transform = `scaleX(${progress})`;
        }
      }),
    [],
  );

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-60 h-0.5 bg-ice/10">
      <div
        ref={barRef}
        className="h-full origin-left bg-linear-to-r from-signal-dim to-signal"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
