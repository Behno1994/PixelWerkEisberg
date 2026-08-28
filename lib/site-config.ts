/**
 * Zentrale Inhalts- und Strukturquelle der Seite.
 *
 * Texte, Navigation und Sektionsinhalte liegen bewusst an einer Stelle, damit
 * Copy angepasst werden kann, ohne Komponenten anzufassen – und damit die
 * Anker-IDs von Navigation und Sektionen nicht auseinanderlaufen.
 */

export const siteConfig = {
  name: "Pixel Werk",
  shortName: "PixelWerk",
  domain: "pixelwerk.de",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://pixelwerk.de",
  tagline: "Webagentur für Industrie & Maschinenbau",
  description:
    "Pixel Werk entwickelt moderne, performante Webauftritte für Industrie, Maschinenbau, Stahlbau und Metallbau – von der Corporate Site bis zum technischen Produktkonfigurator.",
  contact: {
    email: "hallo@pixelwerk.de",
    phone: "+49 000 0000000",
    city: "Deutschland",
  },
} as const;

/** Hauptnavigation. `href` sind Section-Anker auf der Startseite. */
export const navLinks = [
  { label: "Leistungen", href: "#leistungen" },
  { label: "Ansatz", href: "#eisberg" },
  { label: "Referenzen", href: "#referenzen" },
  { label: "Über uns", href: "#ueber-uns" },
] as const;

/**
 * Die Scrollytelling-Beats über dem Eisberg-Canvas.
 *
 * `start`/`end` sind normalisierte Positionen (0–1) innerhalb der
 * Scroll-Story. Sie steuern gleichzeitig den Videofortschritt, damit Text und
 * Bild immer synchron laufen. Beats dürfen sich leicht überlappen – der
 * Cross-Fade wirkt dadurch weicher.
 */
export type StoryBeat = {
  id: string;
  /** Kleiner Kicker über der Hauptzeile, optional. */
  kicker?: string;
  /** Hauptzeile. `emphasis` wird farblich hervorgehoben. */
  line: string;
  emphasis?: string;
  /** Fliesstext unter der Hauptzeile, optional. */
  body?: string;
  start: number;
  end: number;
  /** Über/unter Wasser – steuert die Textfarbe des Beats. */
  depth: "surface" | "deep";
};

export const storyBeats: StoryBeat[] = [
  {
    id: "beat-sichtbar",
    kicker: "Der offensichtliche Teil",
    line: "Eine Webseite, um digital gesehen zu werden.",
    emphasis: "gesehen zu werden",
    start: 0.0,
    end: 0.22,
    depth: "surface",
  },
  {
    id: "beat-spitze",
    line: "Ist nur die Spitze des Eisbergs.",
    emphasis: "Spitze des Eisbergs",
    body: "Was Ihre Kunden sehen, ist ein Bruchteil dessen, was Ihren Auftritt tatsächlich verkaufen lässt.",
    start: 0.2,
    end: 0.42,
    depth: "surface",
  },
  {
    id: "beat-prozesse",
    kicker: "Unter der Oberfläche",
    line: "Prozesse, die aus Anfragen Aufträge machen.",
    emphasis: "Aufträge",
    body: "Angebotsstrecken, CAD- und Datenblatt-Downloads, Produktkonfiguratoren – direkt an ERP, PIM und CRM angebunden.",
    start: 0.4,
    end: 0.62,
    depth: "deep",
  },
  {
    id: "beat-fachkraefte",
    kicker: "Unter der Oberfläche",
    line: "Fachkräfte, die sich bei Ihnen bewerben.",
    emphasis: "bei Ihnen",
    body: "Employer Branding und Karriereportale, die im Wettbewerb um Konstrukteure, Schweisser und Techniker tatsächlich bestehen.",
    start: 0.6,
    end: 0.82,
    depth: "deep",
  },
  {
    id: "beat-umsatz",
    kicker: "Das Ergebnis",
    line: "Messbar mehr Umsatz. Nicht mehr Klicks.",
    emphasis: "mehr Umsatz",
    body: "Wir bauen Industrie-Webauftritte, die sich an Anfragen, Angeboten und Abschlüssen messen lassen.",
    start: 0.8,
    end: 1.0,
    depth: "deep",
  },
];

/** Leistungen – Grid-Karten in der Sektion `#leistungen`. */
export type Service = {
  id: string;
  title: string;
  description: string;
  /** Lucide-Icon-Name, wird in der Sektion aufgelöst. */
  icon: string;
  /** Karte über zwei Spalten darstellen. */
  featured?: boolean;
};

export const services: Service[] = [
  {
    id: "corporate-sites",
    title: "Corporate Sites & Relaunch",
    description:
      "Technisch präzise Unternehmensauftritte, die Fertigungstiefe und Referenzen so zeigen, wie Einkäufer sie prüfen.",
    icon: "LayoutTemplate",
    featured: true,
  },
  {
    id: "konfiguratoren",
    title: "Produktkonfiguratoren",
    description:
      "Varianten, Masse und Optionen als interaktiver Konfigurator – inklusive Angebots-PDF und CAD-Export.",
    icon: "SlidersHorizontal",
  },
  {
    id: "schnittstellen",
    title: "Schnittstellen & Automatisierung",
    description:
      "Anbindung an ERP, PIM und CRM. Produktdaten pflegen Sie einmal – ausgespielt wird überall.",
    icon: "Workflow",
  },
  {
    id: "sichtbarkeit",
    title: "Technische SEO & Sichtbarkeit",
    description:
      "Gefunden werden für Nischenbegriffe, nach denen Ihre Kunden wirklich suchen – nicht für Buzzwords.",
    icon: "Search",
  },
  {
    id: "employer-branding",
    title: "Karriere & Employer Branding",
    description:
      "Karriereportale mit Bewerbungsstrecke, die Fachkräfte erreichen, bevor der Wettbewerb es tut.",
    icon: "Users",
  },
  {
    id: "visualisierung",
    title: "3D & Produktvisualisierung",
    description:
      "Maschinen, Bauteile und Anlagen als interaktive 3D-Ansicht direkt im Browser – ohne Plugin, ohne Download.",
    icon: "Box",
  },
  {
    id: "betrieb",
    title: "Hosting, Wartung & Performance",
    description:
      "Betrieb auf europäischer Infrastruktur, Monitoring, Updates und Ladezeiten, die auch im Werksnetz halten.",
    icon: "Gauge",
  },
];

/** Kennzahlen unter der „Über uns“-Sektion. */
export const stats = [
  { value: 12, suffix: "+", label: "Jahre Industrie-Erfahrung" },
  { value: 80, suffix: "+", label: "Umgesetzte Projekte" },
  { value: 98, suffix: "", label: "Lighthouse-Performance" },
  { value: 100, suffix: "%", label: "Entwicklung in Deutschland" },
] as const;

/**
 * Hall of Fame / Referenzen.
 *
 * Platzhalterdaten – ersetzen, sobald echte Kundenfreigaben vorliegen.
 */
export const references = [
  {
    id: "ref-1",
    client: "Sondermaschinenbau",
    project: "Relaunch & Konfigurator",
    result: "+64 % qualifizierte Anfragen",
  },
  {
    id: "ref-2",
    client: "Stahlbau & Hallenbau",
    project: "Corporate Site & Karriereportal",
    result: "3× mehr Bewerbungen",
  },
  {
    id: "ref-3",
    client: "Metallverarbeitung",
    project: "B2B-Ersatzteilportal",
    result: "−40 % Aufwand im Innendienst",
  },
  {
    id: "ref-4",
    client: "Antriebstechnik",
    project: "Produktdaten & PIM-Anbindung",
    result: "12.000 Artikel automatisiert",
  },
  {
    id: "ref-5",
    client: "Anlagenbau",
    project: "3D-Produktvisualisierung",
    result: "Vertriebszyklus halbiert",
  },
] as const;

/** Branchen-Laufband (Marquee) unter der Hero-Sektion. */
export const industries = [
  "Maschinenbau",
  "Stahlbau",
  "Metallbau",
  "Anlagenbau",
  "Antriebstechnik",
  "Zerspanung",
  "Blechbearbeitung",
  "Fördertechnik",
  "Schweisstechnik",
  "Automatisierung",
] as const;

/** Footer-Rechtslinks. */
export const legalLinks = [
  { label: "Impressum", href: "/impressum" },
  { label: "Datenschutz", href: "/datenschutz" },
  { label: "AGB", href: "/agb" },
  { label: "Kontakt", href: "#kontakt" },
] as const;
