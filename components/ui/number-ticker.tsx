"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useGsapScroll } from "@/hooks/use-gsap-scroll";
import { cn, formatNumber } from "@/lib/utils";

type NumberTickerProps = {
  value: number;
  /** `down` zählt von `value` auf 0 herunter. */
  direction?: "up" | "down";
  /** Verzögerung in Sekunden. */
  delay?: number;
  decimalPlaces?: number;
  className?: string;
};

/**
 * Zählt eine Kennzahl hoch, sobald sie ins Bild scrollt.
 *
 * Der Wert wird per `textContent` geschrieben statt über React-State – ein
 * Re-Render pro Frame wäre für eine reine Zahlanzeige unnötig teuer.
 */
export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  decimalPlaces = 0,
  className,
}: NumberTickerProps) {
  const root = useRef<HTMLSpanElement>(null);

  useGsapScroll(
    (_ctx, scope) => {
      const target = direction === "down" ? 0 : value;

      // Ohne Bewegung nicht hochzählen, sondern direkt den Endwert setzen.
      if (prefersReducedMotion()) {
        scope.textContent =
          decimalPlaces > 0
            ? target.toFixed(decimalPlaces).replace(".", ",")
            : formatNumber(target);
        return;
      }

      const counter = { current: direction === "down" ? value : 0 };

      gsap.to(counter, {
        current: target,
        duration: 2,
        delay,
        ease: "power2.out",
        scrollTrigger: { trigger: scope, start: "top 92%" },
        onUpdate: () => {
          scope.textContent =
            decimalPlaces > 0
              ? counter.current.toFixed(decimalPlaces).replace(".", ",")
              : formatNumber(Math.round(counter.current));
        },
      });
    },
    root,
    [value, direction, delay, decimalPlaces],
  );

  return (
    <span ref={root} className={cn("inline-block tabular-nums tracking-tight", className)}>
      {/* Serverseitiger Startwert – verhindert einen Layout-Sprung vor der Hydration. */}
      {direction === "down" ? formatNumber(value) : 0}
    </span>
  );
}
