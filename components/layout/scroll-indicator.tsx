"use client";

import { useEffect, useRef } from "react";

/**
 * Dünner Fortschrittsbalken am oberen Rand – über das gesamte Dokument.
 *
 * Eigener Scroll-Listener statt eines Stores: Der Balken hängt am Dokument,
 * nicht an der Kino-Szene, und ist der einzige Interessent dieses Werts. Das
 * Schreiben läuft über `requestAnimationFrame`, damit pro Frame höchstens ein
 * Style-Write anfällt.
 */
export function ScrollIndicator() {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let rafId = 0;

    const update = () => {
      rafId = 0;
      const span = document.documentElement.scrollHeight - window.innerHeight;
      const progress = span > 0 ? Math.min(1, Math.max(0, window.scrollY / span)) : 0;
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress})`;
      }
    };

    const schedule = () => {
      if (rafId === 0) rafId = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (rafId !== 0) cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-60 h-0.5 bg-white/10">
      <div
        ref={barRef}
        className="h-full origin-left bg-linear-to-r from-action to-signal"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
