import { cn } from "@/lib/utils";

type MarqueeProps = {
  children: React.ReactNode;
  className?: string;
  reverse?: boolean;
  /** Beim Hover anhalten. */
  pauseOnHover?: boolean;
  vertical?: boolean;
  /** Anzahl der Kopien – mindestens 2, damit die Schleife lückenlos ist. */
  repeat?: number;
  /** Dauer eines vollen Durchlaufs. */
  duration?: string;
  gap?: string;
};

/**
 * Endlos laufendes Band (Logos, Branchen, Schlagworte).
 *
 * Der Inhalt wird `repeat`-mal dupliziert; sobald die erste Kopie komplett
 * herausgelaufen ist, springt die Animation zurück – für das Auge nahtlos,
 * weil an der Sprungstelle identischer Inhalt steht.
 */
export function Marquee({
  children,
  className,
  reverse = false,
  pauseOnHover = false,
  vertical = false,
  repeat = 3,
  duration = "40s",
  gap = "2rem",
}: MarqueeProps) {
  return (
    <div
      style={{ "--marquee-duration": duration, "--marquee-gap": gap } as React.CSSProperties}
      className={cn(
        "group flex overflow-hidden p-2 [gap:var(--marquee-gap)]",
        vertical ? "flex-col" : "flex-row",
        className,
      )}
    >
      {Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          aria-hidden={i > 0}
          className={cn(
            "flex shrink-0 justify-around [gap:var(--marquee-gap)]",
            vertical
              ? "animate-marquee-vertical flex-col"
              : "animate-marquee flex-row",
            reverse && "[animation-direction:reverse]",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
          )}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
