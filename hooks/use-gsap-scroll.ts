"use client";

import type { DependencyList, RefObject } from "react";
import { gsap } from "@/lib/gsap";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect";

/**
 * Führt ein GSAP-Setup innerhalb eines `gsap.context` aus.
 *
 * Der Context sammelt alle Tweens und ScrollTrigger, die in `setup` erzeugt
 * werden, und räumt sie beim Unmount vollständig auf. Ohne ihn überleben
 * ScrollTrigger einen React-Fast-Refresh und feuern doppelt.
 *
 * Alle Selektor-Strings in `setup` sind automatisch auf `scope` beschränkt –
 * `gsap.to(".titel", …)` trifft also nur Elemente innerhalb des Containers.
 *
 * @param setup  Callback, das Tweens/Timelines erstellt.
 * @param scope  Container-Ref, auf den Selektoren begrenzt werden.
 * @param deps   Re-Run-Abhängigkeiten (wie bei `useEffect`).
 */
export function useGsapScroll<T extends HTMLElement>(
  setup: (context: gsap.Context, scope: T) => void,
  scope: RefObject<T | null>,
  deps: DependencyList = [],
) {
  useIsomorphicLayoutEffect(() => {
    const element = scope.current;
    if (!element) return;

    const ctx = gsap.context((self) => setup(self, element), element);
    return () => ctx.revert();
  }, deps);
}
