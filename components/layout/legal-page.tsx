import { cn } from "@/lib/utils";

type LegalPageProps = {
  title: string;
  updatedAt?: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Layout-Rahmen für die Rechtsseiten.
 *
 * Enge Textspalte, ruhiger Hintergrund – hier soll nichts animiert werden.
 */
export function LegalPage({ title, updatedAt, children, className }: LegalPageProps) {
  return (
    <article className="relative z-10 bg-abyss/90 py-32 backdrop-blur-xl">
      <div className={cn("container-page max-w-3xl", className)}>
        <h1 className="text-4xl font-semibold tracking-tight text-glacier sm:text-5xl">
          {title}
        </h1>
        {updatedAt && (
          <p className="mt-3 text-sm text-steel">Stand: {updatedAt}</p>
        )}

        <div
          className={cn(
            "mt-10 flex flex-col gap-6 text-base leading-relaxed text-steel",
            "[&_h2]:mt-6 [&_h2]:[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-glacier",
            "[&_a]:text-signal [&_a]:underline [&_a]:underline-offset-4",
            "[&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2",
          )}
        >
          {children}
        </div>
      </div>
    </article>
  );
}
