"use client";

import { cn } from "@/lib/utils";

type BorderBeamProps = {
  className?: string;
  size?: number;
  duration?: number;
  delay?: number;
  colorFrom?: string;
  colorTo?: string;
};

/**
 * Lichtpunkt, der auf der Rahmenkante eines Containers entlangwandert.
 *
 * Der Elternteil braucht `position: relative` und `overflow: hidden`.
 * Umsetzung über `offset-path`, damit der Beam auch abgerundete Ecken
 * korrekt nachfährt.
 */
export function BorderBeam({
  className,
  size = 220,
  duration = 8,
  delay = 0,
  colorFrom = "var(--color-signal)",
  colorTo = "transparent",
}: BorderBeamProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        "[border:1px_solid_transparent] ![mask-clip:padding-box,border-box] ![mask-composite:intersect]",
        "[mask:linear-gradient(transparent,transparent),linear-gradient(#fff,#fff)]",
        className,
      )}
    >
      <div
        className={cn(
          "absolute aspect-square animate-border-beam",
          "bg-linear-to-l from-(--beam-from) via-(--beam-to) to-transparent",
          "[offset-anchor:90%_50%] [offset-path:rect(0_auto_auto_0_round_200px)]",
        )}
        style={
          {
            width: size,
            "--beam-from": colorFrom,
            "--beam-to": colorTo,
            "--beam-duration": `${duration}s`,
            animationDelay: `${delay}s`,
          } as React.CSSProperties
        }
      />
    </div>
  );
}
