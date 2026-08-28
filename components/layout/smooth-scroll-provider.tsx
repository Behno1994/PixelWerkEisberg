"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { useSmoothScroll } from "@/hooks/use-smooth-scroll";

/**
 * Aktiviert Smooth-Scrolling für die gesamte Anwendung und hält ScrollTrigger
 * über Layout-Änderungen hinweg aktuell.
 */
export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  useSmoothScroll();

  useEffect(() => {
    // Bilder und Webfonts kommen nach dem ersten Layout an und verschieben
    // Sektionen. Ohne Refresh rechnen ScrollTrigger mit veralteten Höhen.
    const refresh = () => ScrollTrigger.refresh();

    if (document.fonts) void document.fonts.ready.then(refresh);
    window.addEventListener("load", refresh);

    return () => window.removeEventListener("load", refresh);
  }, []);

  return <>{children}</>;
}
