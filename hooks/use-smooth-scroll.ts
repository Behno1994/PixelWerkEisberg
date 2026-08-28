"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { registerLenis } from "@/lib/smooth-scroll";
import { useReducedMotion } from "./use-media-query";

/**
 * Aktiviert Lenis-Smooth-Scrolling und koppelt es an GSAP.
 *
 * Lenis besitzt die Scroll-Position, GSAP treibt den Frame-Loop. Ohne diese
 * Kopplung laufen ScrollTrigger-Berechnungen und die interpolierte
 * Lenis-Position auseinander und gepinnte Sektionen zittern.
 *
 * Bei `prefers-reduced-motion` wird nativ gescrollt.
 */
export function useSmoothScroll() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      // Exponentielles Ausklingen – kurz genug, dass Klicks sich direkt anfühlen.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      // Touch-Geräte behalten ihr natives Momentum-Scrolling.
      syncTouch: false,
    });

    registerLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    // Lenis erwartet Millisekunden, der GSAP-Ticker liefert Sekunden.
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      registerLenis(null);
      lenis.destroy();
    };
  }, [reducedMotion]);
}
