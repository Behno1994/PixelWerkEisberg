"use client";

import { useRef } from "react";
import { AnimatePresence, motion, useInView, type Variants } from "motion/react";

type BlurFadeProps = {
  children: React.ReactNode;
  className?: string;
  /** Startversatz in Pixeln (Richtung siehe `direction`). */
  offset?: number;
  direction?: "up" | "down" | "left" | "right";
  delay?: number;
  duration?: number;
  blur?: string;
  /** Anteil des Elements, der sichtbar sein muss, bevor animiert wird. */
  inViewMargin?: string;
  /** Animation bei jedem Sichtbarwerden erneut abspielen. */
  once?: boolean;
};

/**
 * Reveal-Wrapper: Element blendet beim Scrollen weich und leicht unscharf ein.
 * Magic-UI-kompatible API – bewusst auf `motion` statt GSAP, weil es sich um
 * viele kleine, unabhängige Einzel-Reveals handelt (kein Scrub).
 */
export function BlurFade({
  children,
  className,
  offset = 16,
  direction = "up",
  delay = 0,
  duration = 0.6,
  blur = "8px",
  inViewMargin = "-60px",
  once = true,
}: BlurFadeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: inViewMargin as never });

  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const sign = direction === "right" || direction === "down" ? -1 : 1;

  const variants: Variants = {
    hidden: { [axis]: offset * sign, opacity: 0, filter: `blur(${blur})` },
    visible: { [axis]: 0, opacity: 1, filter: "blur(0px)" },
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        exit="hidden"
        variants={variants}
        transition={{ delay: 0.04 + delay, duration, ease: [0.21, 0.47, 0.32, 0.98] }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
