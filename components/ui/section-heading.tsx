import { cn } from "@/lib/utils";
import { BlurFade } from "./blur-fade";

type SectionHeadingProps = {
  /** Kleiner Kicker über der Überschrift. */
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
};

/** Einheitlicher Sektionskopf: Kicker, Überschrift, Beschreibung. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex max-w-3xl flex-col gap-4",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      {eyebrow && (
        <BlurFade>
          <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.22em] text-signal">
            <span aria-hidden className="h-px w-8 bg-signal/60" />
            {eyebrow}
          </span>
        </BlurFade>
      )}

      <BlurFade delay={0.08}>
        <h2 className="text-balance text-3xl font-semibold leading-[1.1] tracking-tight text-glacier sm:text-4xl lg:text-5xl">
          {title}
        </h2>
      </BlurFade>

      {description && (
        <BlurFade delay={0.16}>
          <p className="text-pretty text-base leading-relaxed text-steel sm:text-lg">
            {description}
          </p>
        </BlurFade>
      )}
    </div>
  );
}
