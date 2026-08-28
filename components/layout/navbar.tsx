"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { DiamondLogo } from "@/components/ui/diamond-logo";
import { PulseCta } from "@/components/ui/pulse-cta";
import { navLinks, siteConfig } from "@/lib/site-config";
import { scrollToTarget } from "@/lib/smooth-scroll";
import { cn } from "@/lib/utils";

/**
 * Kopfzeile: Logo links, Navigation mittig, pulsierender Kontakt-Button rechts.
 *
 * Ab ~40 px Scroll verdichtet sich die Leiste zu einer Glasfläche – über dem
 * hellen Wasserbereich der Hero-Sektion bliebe sie sonst unlesbar.
 */
export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    scrollToTarget(href, -(headerRef.current?.offsetHeight ?? 72) - 8);
  };

  return (
    <header
      ref={headerRef}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled ? "py-2" : "py-4",
      )}
    >
      <div
        className={cn(
          "container-page flex items-center justify-between gap-6 rounded-full transition-all duration-500",
          scrolled
            ? "panel-glass py-2 shadow-panel"
            : "border border-transparent bg-transparent py-2",
        )}
      >
        {/* Links: Logo + Wortmarke */}
        <Link
          href="/"
          className="group flex shrink-0 items-center gap-3"
          aria-label={`${siteConfig.name} – Startseite`}
        >
          <DiamondLogo className="h-8 w-8 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" />
          <span className="font-display text-lg font-semibold leading-none tracking-tight text-glacier">
            Pixel<span className="text-signal">Werk</span>
          </span>
        </Link>

        {/* Mitte: Navigation */}
        <nav aria-label="Hauptnavigation" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={(event) => handleAnchor(event, link.href)}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-medium text-steel transition-colors",
                    "hover:text-glacier",
                    "after:absolute after:inset-x-4 after:bottom-1 after:h-px after:origin-left after:scale-x-0",
                    "after:bg-signal after:transition-transform after:duration-300 hover:after:scale-x-100",
                  )}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Rechts: prominenter CTA */}
        <div className="flex shrink-0 items-center gap-2">
          <PulseCta
            href="#kontakt"
            className="hidden sm:inline-flex"
            onClick={(event) => handleAnchor(event, "#kontakt")}
          >
            Kontakt
            <ArrowUpRight className="size-4" />
          </PulseCta>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Menü schliessen" : "Menü öffnen"}
            className="grid size-10 place-items-center rounded-full border border-ice/20 text-glacier transition-colors hover:border-signal/60 lg:hidden"
          >
            {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div id="mobile-nav" hidden={!menuOpen} className="container-page mt-2 lg:hidden">
        {/* Deckender als `panel-glass`: Über dem hellen Eisberg-Hintergrund
            wäre ein durchscheinendes Menü nicht lesbar. */}
        <nav
          aria-label="Mobile Navigation"
          className="flex flex-col gap-1 rounded-3xl border border-ice/15 bg-deep/95 p-4 shadow-panel backdrop-blur-xl"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => handleAnchor(event, link.href)}
              className="rounded-2xl px-4 py-3 text-base font-medium text-glacier transition-colors hover:bg-ocean/50"
            >
              {link.label}
            </a>
          ))}
          <PulseCta
            href="#kontakt"
            size="sm"
            className="mt-2 self-start"
            onClick={(event) => handleAnchor(event, "#kontakt")}
          >
            Kontakt
            <ArrowUpRight className="size-4" />
          </PulseCta>
        </nav>
      </div>
    </header>
  );
}
