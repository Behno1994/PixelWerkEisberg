"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";

type NumberTickerProps = {
  value: number;
  /** Startwert; bei `direction: "down"` wird von `value` heruntergezählt. */
  direction?: "up" | "down";
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
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(direction === "down" ? value : 0);
  const spring = useSpring(motionValue, { damping: 60, stiffness: 90 });
  const inView = useInView(ref, { once: true, margin: "0px 0px -80px 0px" });

  useEffect(() => {
    if (!inView) return;
    const timer = window.setTimeout(
      () => motionValue.set(direction === "down" ? 0 : value),
      delay * 1000,
    );
    return () => window.clearTimeout(timer);
  }, [inView, value, direction, delay, motionValue]);

  useEffect(
    () =>
      spring.on("change", (latest: number) => {
        if (!ref.current) return;
        ref.current.textContent =
          decimalPlaces > 0
            ? latest.toFixed(decimalPlaces).replace(".", ",")
            : formatNumber(Math.round(latest));
      }),
    [spring, decimalPlaces],
  );

  return (
    <span
      ref={ref}
      className={cn("inline-block tabular-nums tracking-tight", className)}
    >
      {/* Serverseitiger Startwert – verhindert Layout-Sprung vor der Hydration. */}
      {direction === "down" ? formatNumber(value) : 0}
    </span>
  );
}
