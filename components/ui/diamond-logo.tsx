import { cn } from "@/lib/utils";

type DiamondLogoProps = {
  className?: string;
  /** Eindeutiges Gradient-Präfix, falls das Logo mehrfach im DOM steht. */
  idPrefix?: string;
  /** Dekorativ (Logo steht neben dem Wortmarken-Text) oder eigenständig. */
  title?: string;
};

/**
 * Wortmarken-Logo „Pixel Werk“: ein geschliffener Diamant.
 *
 * Reines SVG statt Bilddatei – so skaliert das Logo verlustfrei, färbt sich
 * über `currentColor`-nahe Tokens und kostet keinen zusätzlichen Request.
 * Die Facetten sind bewusst als einzelne Polygone modelliert, damit sie später
 * einzeln animiert (oder als Extrusionsvorlage für die Three.js-Version
 * genutzt) werden können.
 */
export function DiamondLogo({ className, idPrefix = "pw", title }: DiamondLogoProps) {
  const crown = `${idPrefix}-crown`;
  const facetLeft = `${idPrefix}-facet-left`;
  const facetRight = `${idPrefix}-facet-right`;
  const pavilion = `${idPrefix}-pavilion`;
  const shine = `${idPrefix}-shine`;

  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("h-9 w-9", className)}
    >
      <defs>
        <linearGradient id={crown} x1="10" y1="6" x2="38" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#E6F6FF" />
          <stop offset="0.55" stopColor="#9FDCF5" />
          <stop offset="1" stopColor="#4FC3E8" />
        </linearGradient>
        <linearGradient id={facetLeft} x1="4" y1="6" x2="14" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7ECDEA" />
          <stop offset="1" stopColor="#2C7FA6" />
        </linearGradient>
        <linearGradient id={facetRight} x1="44" y1="6" x2="34" y2="18" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B6E9FB" />
          <stop offset="1" stopColor="#1D6A90" />
        </linearGradient>
        <linearGradient id={pavilion} x1="24" y1="18" x2="24" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5FC5E6" />
          <stop offset="1" stopColor="#0A3B54" />
        </linearGradient>
        <linearGradient id={shine} x1="14" y1="18" x2="24" y2="44" gradientUnits="userSpaceOnUse">
          <stop stopColor="#DFF4FF" stopOpacity="0.9" />
          <stop offset="1" stopColor="#22D3EE" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      {/* Krone: Tafel und zwei seitliche Facetten */}
      <path d="M10 6h28l-4 12H14L10 6Z" fill={`url(#${crown})`} />
      <path d="M10 6 4 18h10L10 6Z" fill={`url(#${facetLeft})`} />
      <path d="M38 6l6 12H34L38 6Z" fill={`url(#${facetRight})`} />

      {/* Pavillon: vier Facetten laufen auf die Kalette zu */}
      <path d="M4 18h10l10 26L4 18Z" fill={`url(#${pavilion})`} opacity="0.95" />
      <path d="M14 18h10v26L14 18Z" fill={`url(#${shine})`} />
      <path d="M24 18h10L24 44V18Z" fill={`url(#${pavilion})`} />
      <path d="M34 18h10L24 44l10-26Z" fill={`url(#${facetRight})`} opacity="0.75" />

      {/* Kantenzeichnung – hält die Silhouette auf kleinen Grössen scharf */}
      <path
        d="M10 6h28l6 12L24 44 4 18 10 6Z"
        stroke="#DFF4FF"
        strokeOpacity="0.5"
        strokeWidth="0.9"
        strokeLinejoin="round"
      />
      <path
        d="M4 18h40M14 18 10 6M34 18 38 6M14 18l10 26M34 18 24 44"
        stroke="#EAF9FF"
        strokeOpacity="0.35"
        strokeWidth="0.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}
