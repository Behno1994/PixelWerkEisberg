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

export { gsap, ScrollTrigger, ScrollToPlugin };
