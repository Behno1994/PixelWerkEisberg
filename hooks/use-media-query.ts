"use client";

import { useEffect, useState } from "react";

/** Reaktiver Media-Query-Hook. Liefert beim ersten Server-Render `false`. */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);

    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}

/** `true`, wenn der Nutzer reduzierte Bewegung angefordert hat. */
export function useReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
