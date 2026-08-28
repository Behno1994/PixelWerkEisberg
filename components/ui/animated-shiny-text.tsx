import { cn } from "@/lib/utils";

type AnimatedShinyTextProps = {
  children: React.ReactNode;
  className?: string;
  /** Breite des Glanzstreifens in `em`. */
  shimmerWidth?: number;
};

/** Text mit durchlaufendem Glanzstreifen – für Badges und Kicker. */
export function AnimatedShinyText({
  children,
  className,
  shimmerWidth = 90,
}: AnimatedShinyTextProps) {
  return (
    <span
      style={{ "--shiny-width": `${shimmerWidth}px` } as React.CSSProperties}
      className={cn(
        "animate-shimmer bg-clip-text text-transparent",
        "bg-size-[200%_100%] bg-position-[0_0]",
        "bg-linear-to-r from-transparent via-glacier/90 via-50% to-transparent",
        "text-steel",
        className,
      )}
    >
      {children}
    </span>
  );
}
