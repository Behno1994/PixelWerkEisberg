"use client";

import { useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { useGsapScroll } from "@/hooks/use-gsap-scroll";
import { cn } from "@/lib/utils";

type BlurFadeProps = {
  children: React.ReactNode;
  className?: string;
  /** Startversatz in Pixeln (Richtung siehe `direction`). */
  offset?: number;
  direction?: "up" | "down" | "left" | "right";
  /** Verzögerung in Sekunden. */
  delay?: number;
  duration?: number;
  blur?: string;
  /** Wie weit das Element im Viewport stehen muss, bevor animiert wird. */
  start?: string;
  /** Beim Zurückscrollen erneut abspielen. */
  once?: boolean;
};

/**
 * Reveal-Wrapper: Element blendet beim Scrollen weich und leicht unscharf ein.
 *
 * Läuft über GSAP/ScrollTrigger – dieselbe Engine, die auch das
 * Smooth-Scrolling treibt. Zwei Animationssysteme parallel würden sich
 * denselben Frame teilen, ohne dass eines vom anderen weiss.
 */
export function BlurFade({
  children,
  className,
  offset = 16,
  direction = "up",
  delay = 0,
  duration = 0.6,
  blur = "8px",
  start = "top 88%",
  once = true,
}: BlurFadeProps) {
  const root = useRef<HTMLDivElement>(null);

  useGsapScroll(
    (_ctx, scope) => {
      // Ohne Bewegung nur einblenden – kein Versatz, keine Unschärfe, keine Dauer.
      if (prefersReducedMotion()) {
        gsap.set(scope, { autoAlpha: 1, x: 0, y: 0, filter: "none" });
        return;
      }

      const axis = direction === "left" || direction === "right" ? "x" : "y";
      const sign = direction === "right" || direction === "down" ? -1 : 1;

      gsap.fromTo(
        scope,
        { [axis]: offset * sign, autoAlpha: 0, filter: `blur(${blur})` },
        {
          [axis]: 0,
          autoAlpha: 1,
          filter: "blur(0px)",
          duration,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: scope,
            start,
            toggleActions: once ? "play none none none" : "play none none reverse",
          },
        },
      );
    },
    root,
    [offset, direction, delay, duration, blur, start, once],
  );

  // `invisible` verhindert ein Aufblitzen, bevor GSAP den Startzustand setzt;
  // `autoAlpha` schaltet die Sichtbarkeit anschliessend mit.
  return (
    <div ref={root} className={cn("invisible", className)}>
      {children}
    </div>
  );
}
