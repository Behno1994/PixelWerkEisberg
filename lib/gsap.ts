"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

/**
 * Zentrale GSAP-Registrierung.
 *
 * Plugins dürfen nur im Browser registriert werden – auf dem Server existiert
 * kein `document`. Jede Client-Komponente importiert `gsap`/`ScrollTrigger`
 * ausschliesslich aus dieser Datei, damit die Registrierung genau einmal
 * passiert und alle Komponenten dieselbe GSAP-Instanz teilen.
 */
let registered = false;

if (typeof window !== "undefined" && !registered) {
  registered = true;
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

  // Sanftere Defaults für die gesamte Seite.
  gsap.defaults({ ease: "power2.out", duration: 0.9 });

  // ScrollTrigger soll bei Resize nicht bei jedem Pixel neu rechnen
  // (mobile Browser ändern die Viewport-Höhe beim Ein-/Ausblenden der URL-Leiste).
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/**
 * `true`, wenn der Nutzer reduzierte Bewegung angefordert hat.
 *
 * GSAP animiert Inline-Styles; die CSS-Regel in `globals.css` greift dort
 * nicht. Tweens müssen die Einstellung deshalb selbst berücksichtigen –
 * in der Regel, indem sie mit Dauer 0 direkt in den Endzustand springen.
 */
export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger, ScrollToPlugin };
