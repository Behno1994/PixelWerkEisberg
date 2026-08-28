"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type PulseCtaProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
  /** Kompaktere Variante für die mobile Navigation. */
  size?: "sm" | "md";
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
};

/**
 * Der prominente „Kontakt“-Button.
 *
 * Drei überlagerte Ebenen erzeugen den Effekt:
 *  1. zwei versetzt pulsierende Ringe (`animate-pulse-ring`) hinter dem Button,
 *  2. ein durchlaufender Glanzstreifen über der Fläche,
 *  3. ein weicher Glow, der beim Hover intensiver wird.
 *
 * Die Ringe liegen hinter dem Inhalt und sind `pointer-events-none`, damit die
 * Klickfläche exakt der Buttonfläche entspricht.
 */
export function PulseCta({ href, children, className, size = "md", onClick }: PulseCtaProps) {
  return (
    <span className={cn("relative inline-flex isolate", className)}>
      {/* Pulsierende Ringe */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-signal/40 animate-pulse-ring"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 rounded-full bg-signal/25 animate-pulse-ring [animation-delay:1.3s]"
      />

      <Link
        href={href}
        onClick={onClick}
        className={cn(
          "group relative overflow-hidden rounded-full font-semibold tracking-tight",
          "bg-linear-to-b from-signal to-signal-dim text-abyss",
          "shadow-[0_0_28px_-6px_var(--color-signal)] ring-1 ring-inset ring-white/25",
          "transition-transform duration-300 hover:-translate-y-0.5 active:translate-y-0",
          size === "sm" ? "h-9 px-5 text-sm" : "h-11 px-6 text-sm",
          "inline-flex items-center justify-center gap-2",
        )}
      >
        {/* Glanzstreifen */}
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-0 -translate-x-full",
            "bg-linear-to-r from-transparent via-white/50 to-transparent",
            "transition-transform duration-700 ease-out group-hover:translate-x-full",
          )}
        />
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </Link>
    </span>
  );
}
