import { cn } from "@/lib/utils";
import { DiamondLogo } from "./diamond-logo";

type PixelWordmarkProps = {
  className?: string;
  /** Steuert Diamant- und Schriftgrösse gemeinsam. */
  size?: "sm" | "md" | "lg";
  /** `true` über hellen Video-Frames – Schrift wird dunkel. */
  onLight?: boolean;
  idPrefix?: string;
};

const sizes = {
  sm: { icon: "h-6 w-6", text: "text-sm" },
  md: { icon: "h-8 w-8", text: "text-base sm:text-lg" },
  lg: { icon: "h-12 w-12", text: "text-2xl sm:text-3xl" },
} as const;

/**
 * Wortmarke „PIXEL WERK" – Diamant plus Schriftzug in Pixelschrift.
 *
 * Der Schriftzug läuft über `--font-pixel` (Pixelify Sans). Pixelschriften
 * rastern auf ihre eigene Pixelmatrix; ein Antialiasing-Glättung würde die
 * Kanten verwaschen, deshalb bleibt `-webkit-font-smoothing` hier aussen vor
 * und der Buchstabenabstand ist leicht geöffnet.
 */
export function PixelWordmark({
  className,
  size = "md",
  onLight = false,
  idPrefix = "wordmark",
}: PixelWordmarkProps) {
  return (
    <span className={cn("flex items-center gap-2.5 sm:gap-3", className)}>
      <DiamondLogo
        idPrefix={idPrefix}
        className={cn(
          sizes[size].icon,
          "shrink-0 drop-shadow-[0_0_12px_rgba(0,240,255,0.45)]",
        )}
      />
      <span
        className={cn(
          "font-pixel font-bold uppercase leading-none tracking-[0.08em]",
          "transition-colors duration-500",
          sizes[size].text,
          onLight ? "text-abyss" : "text-white",
        )}
      >
        Pixel<span className="text-signal"> Werk</span>
      </span>
    </span>
  );
}
