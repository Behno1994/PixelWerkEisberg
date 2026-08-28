import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { DiamondLogo } from "@/components/ui/diamond-logo";
import { legalLinks, navLinks, siteConfig } from "@/lib/site-config";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t border-ice/10 bg-abyss/80 backdrop-blur-xl">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <DiamondLogo className="h-8 w-8" idPrefix="footer" />
            <span className="text-lg font-semibold tracking-tight text-glacier">
              Pixel<span className="text-signal">Werk</span>
            </span>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-steel">
            {siteConfig.description}
          </p>
        </div>

        <nav aria-label="Footer-Navigation" className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-ice/70">
            Navigation
          </h2>
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-steel transition-colors hover:text-signal"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex flex-col gap-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-ice/70">
            Kontakt
          </h2>
          <a
            href={`mailto:${siteConfig.contact.email}`}
            className="inline-flex items-center gap-2 text-sm text-steel transition-colors hover:text-signal"
          >
            <Mail className="size-4" />
            {siteConfig.contact.email}
          </a>
          <a
            href={`tel:${siteConfig.contact.phone.replace(/\s/g, "")}`}
            className="inline-flex items-center gap-2 text-sm text-steel transition-colors hover:text-signal"
          >
            <Phone className="size-4" />
            {siteConfig.contact.phone}
          </a>
        </div>
      </div>

      <div className="border-t border-ice/10">
        <div className="container-page flex flex-col gap-4 py-6 text-xs text-steel sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name} – {siteConfig.tagline}. Alle Rechte vorbehalten.
          </p>
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {legalLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="transition-colors hover:text-signal">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
