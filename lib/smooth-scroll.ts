"use client";

import type Lenis from "lenis";

/**
 * Registry für die aktive Lenis-Instanz.
 *
 * Anker-Sprünge müssen über Lenis laufen: Ein natives `scrollIntoView` setzt
 * die Scroll-Position hart, während Lenis noch interpoliert – das Ergebnis ist
 * ein sichtbarer Rücksprung. Statt die Instanz durch den halben Baum zu
 * reichen, liegt sie hier als Singleton.
 */
let instance: Lenis | null = null;

export function registerLenis(lenis: Lenis | null) {
  instance = lenis;
}

/**
 * Scrollt zu einem Anker (`#id`) oder Element.
 * Fällt ohne aktive Lenis-Instanz (z. B. bei reduzierter Bewegung) auf
 * natives Scrollen zurück.
 */
export function scrollToTarget(target: string | HTMLElement, offset = -72) {
  if (instance) {
    instance.scrollTo(target, { offset, duration: 1.3 });
    return;
  }

  const element =
    typeof target === "string" ? document.querySelector<HTMLElement>(target) : target;
  if (!element) return;

  window.scrollTo({
    top: element.getBoundingClientRect().top + window.scrollY + offset,
    behavior: "smooth",
  });
}
