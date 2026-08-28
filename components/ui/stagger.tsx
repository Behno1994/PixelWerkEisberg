"use client";

import { cn } from "@/lib/utils";

type StaggerProps = {
  children: React.ReactNode;
  /** Sichtbar, sobald die umgebende Stufe deutlich eingeblendet ist. */
  visible: boolean;
  /** Versatz in Millisekunden. */
  delay?: number;
  className?: string;
};

/**
 * Gestaffelter Auftritt eines Kindelements innerhalb einer Story-Stufe.
 *
 * Bewusst reines CSS statt einer Animationsbibliothek: Die Stufen werden per
 * Scroll gescrubbt und können sekündlich mehrfach umschlagen. Ein JS-getriebener
 * Tween müsste dabei ständig neu gestartet werden – eine CSS-Transition
 * interpoliert einfach vom aktuellen Zwischenstand aus weiter.
 */
export function Stagger({ children, visible, delay = 0, className }: StaggerProps) {
  return (
    <div
      className={cn("will-change-[opacity,transform]", className)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}
