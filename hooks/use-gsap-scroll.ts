"use client";

import { useEffect, useRef, type DependencyList, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
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

/**
 * Meldet den normalisierten Scroll-Fortschritt (0–1) eines Elements.
 *
 * Der Wert landet bewusst nicht im React-State: Ein State-Update pro
 * Scroll-Frame würde bei 120 Hz den Main-Thread fluten. Stattdessen bekommt der
 * Aufrufer den Wert direkt im Callback und schreibt ihn imperativ – etwa in
 * eine CSS-Transform oder auf ein Canvas.
 *
 * @param scope       Element, dessen Scroll-Fortschritt gemessen wird.
 * @param onProgress  Wird bei jedem Scroll-Update aufgerufen.
 * @param options     `start`/`end`/`scrub`/`pin` wie bei ScrollTrigger.
 */
export function useScrollProgress<T extends HTMLElement>(
  scope: RefObject<T | null>,
  onProgress: (progress: number, self: ScrollTrigger) => void,
  options: {
    start?: string;
    end?: string;
    scrub?: boolean | number;
    pin?: boolean;
  } = {},
) {
  const { start = "top top", end = "bottom bottom", scrub = true, pin = false } = options;

  // Der Callback darf sich bei jedem Render ändern, ohne den ScrollTrigger neu
  // aufzubauen. Das Ref wird ausschliesslich in einem Effect beschrieben –
  // ein Schreibzugriff während des Renderings wäre in React 19 unzulässig.
  const callbackRef = useRef(onProgress);
  useEffect(() => {
    callbackRef.current = onProgress;
  });

  useIsomorphicLayoutEffect(() => {
    const element = scope.current;
    if (!element) return;

    const trigger = ScrollTrigger.create({
      trigger: element,
      start,
      end,
      scrub,
      pin,
      onUpdate: (self) => callbackRef.current(self.progress, self),
      onRefresh: (self) => callbackRef.current(self.progress, self),
    });

    return () => trigger.kill();
  }, [scope, start, end, scrub, pin]);
}
