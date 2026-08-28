"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { DiamondLogo } from "@/components/ui/diamond-logo";
import { useReducedMotion } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

/**
 * Die Three.js-Szene wird erst im Browser geladen.
 *
 * `ssr: false` ist bei WebGL zwingend (kein `canvas` auf dem Server) und hält
 * three.js zusätzlich aus dem initialen JS-Bundle heraus – die Hero-Sektion
 * ist dadurch interaktiv, bevor der Renderer überhaupt angefordert wird.
 */
const DiamondScene = dynamic(() => import("./diamond-scene"), {
  ssr: false,
  loading: () => null,
});

type HeroDiamondProps = {
  className?: string;
};

export function HeroDiamond({ className }: HeroDiamondProps) {
  const reducedMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;

    // WebGL-Unterstützung prüfen, bevor die Szene angefordert wird.
    const canvas = document.createElement("canvas");
    const supported = Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
    if (!supported) return;

    // Nach dem ersten Paint starten, damit die Szene nicht mit dem
    // Hero-Text um Rechenzeit konkurriert.
    const id = window.requestIdleCallback
      ? window.requestIdleCallback(() => setEnabled(true), { timeout: 1200 })
      : window.setTimeout(() => setEnabled(true), 400);

    return () => {
      if (window.cancelIdleCallback) window.cancelIdleCallback(id as number);
      else window.clearTimeout(id as number);
    };
  }, [reducedMotion]);

  return (
    <div className={cn("relative aspect-square w-full", className)}>
      {/* Glow hinter dem Stein */}
      <div
        aria-hidden
        className="absolute inset-[12%] rounded-full bg-signal/20 blur-3xl"
      />

      {enabled ? (
        <DiamondScene />
      ) : (
        // Statische Vektor-Version: identische Silhouette, null Laufzeitkosten.
        <div className="flex h-full w-full items-center justify-center">
          <DiamondLogo className="h-3/5 w-3/5 animate-float drop-shadow-[0_0_45px_rgba(34,211,238,0.35)]" />
        </div>
      )}
    </div>
  );
}
