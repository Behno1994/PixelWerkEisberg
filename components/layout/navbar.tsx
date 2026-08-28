"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { PixelWordmark } from "@/components/ui/pixel-wordmark";
import { LIGHT_TO_DARK } from "@/components/canvas/cinematic-scene";
import { navLinks, siteConfig } from "@/lib/site-config";
import { sceneProgress } from "@/lib/scroll-progress";
import { scrollToTarget } from "@/lib/smooth-scroll";
import { cn } from "@/lib/utils";

/**
 * Kopfzeile: Wortmarke links, Navigation mittig, pulsierender Kontakt-Button rechts.
 *
 * Die Schriftfarbe folgt dem Bildhintergrund: Über den hellen Frames der
 * Kino-Szene steht sie dunkel, ab dem Umschlagpunkt (p > 0.55) hell. Der Wert
 * kommt aus `sceneProgress` – die Szene rechnet ihn ohnehin pro Frame aus, ein
 * zweiter Scroll-Listener wäre reine Doppelarbeit.
 *
 * Abweichend von einer reinen One-Page-Szene bleibt die Leiste `fixed` statt
 * im Sticky-Container zu liegen: Unterhalb der Szene folgen weitere Sektionen,
 * und die Navigation muss dort erreichbar bleiben.
 */
export function Navbar() {
  const [onLight, setOnLight] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(
    () =>
      sceneProgress.subscribe((progress) => {
        // Unterhalb der Szene ist der Fortschritt 1 – dort gilt ebenfalls
        // „dunkler Hintergrund", was zu den folgenden Sektionen passt.
        setOnLight(progress <= LIGHT_TO_DARK);
      }),
    [],
  );

  // Hintergrund sperren, solange das mobile Menü offen ist.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const handleAnchor = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("#")) return;
    event.preventDefault();
    setMenuOpen(false);
    scrollToTarget(href, -96);
  };

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-6 pb-6 pt-6 sm:px-8 sm:pt-8 md:px-12">
        <div className="flex items-center justify-between">
          {/* Links: Diamant + Wortmarke in Pixelschrift */}
          <Link
            href="/"
            aria-label={`${siteConfig.name} – Startseite`}
            className="group pointer-events-auto"
          >
            <PixelWordmark
              onLight={onLight}
              className="transition-transform duration-500 group-hover:scale-[1.03]"
            />
          </Link>

          {/* Mitte: Navigation */}
          <nav aria-label="Hauptnavigation" className="pointer-events-auto hidden lg:block">
            <ul className="flex items-center gap-8">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={(event) => handleAnchor(event, link.href)}
                    className={cn(
                      "text-xs font-medium uppercase tracking-[0.15em] transition-opacity duration-300 hover:opacity-70",
                      onLight ? "text-slate-900" : "text-white",
                    )}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Rechts: pulsierender CTA, mobil das Menü */}
          <div className="pointer-events-auto flex items-center gap-3">
            <a
              href="#kontakt"
              onClick={(event) => handleAnchor(event, "#kontakt")}
              className={cn(
                "hidden rounded-full bg-action px-6 py-2.5 text-xs font-semibold uppercase tracking-widest text-white sm:inline-block",
                "animate-cta-glow transition-colors duration-300 hover:bg-action-bright",
              )}
            >
              Kontakt
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              aria-label="Menü öffnen"
              className={cn(
                "grid size-10 place-items-center rounded-full border transition-colors duration-500 lg:hidden",
                onLight
                  ? "border-slate-900/25 text-slate-900"
                  : "border-white/25 text-white",
              )}
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobiles Vollbildmenü */}
      <div
        id="mobile-nav"
        hidden={!menuOpen}
        className="fixed inset-0 z-100 flex flex-col bg-abyss px-6 pb-10 pt-6 sm:px-8 lg:hidden"
      >
        <div className="flex items-center justify-between">
          <PixelWordmark />
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Menü schliessen"
            className="grid size-10 place-items-center rounded-full border border-white/25 text-white"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav
          aria-label="Mobile Navigation"
          className="mt-16 flex flex-1 flex-col justify-center gap-2"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => handleAnchor(event, link.href)}
              className="border-b border-white/10 py-5 text-lg font-medium uppercase tracking-[0.15em] text-white transition-colors hover:text-signal"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#kontakt"
          onClick={(event) => handleAnchor(event, "#kontakt")}
          className="animate-cta-glow rounded-full bg-action px-6 py-4 text-center text-xs font-semibold uppercase tracking-widest text-white"
        >
          Kontakt
        </a>
      </div>
    </>
  );
}
