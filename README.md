# Pixel Werk

Webauftritt der Webagentur **Pixel Werk** – spezialisiert auf Industrie,
Maschinenbau, Stahlbau und Metallbau.

Kern der Seite ist ein **Scrollytelling-Eisberg**: Ein seitenweiter
Canvas-Hintergrund fährt beim Scrollen von der Wasseroberfläche in die Tiefsee,
während die Textbeats nacheinander ein- und ausgeblendet werden.

## Stack

| Bereich      | Technologie                                    |
| ------------ | ---------------------------------------------- |
| Framework    | Next.js 16 (App Router, React 19, TypeScript)   |
| Styling      | Tailwind CSS v4 (`@theme`-Tokens, keine Config) |
| Scroll & Anim| GSAP 3 + ScrollTrigger, Lenis (Smooth Scroll)   |
| 3D           | three.js, React Three Fiber, drei               |
| UI-Bausteine | Magic-UI-kompatible Komponenten (`components/ui`), `motion` |
| Icons        | lucide-react                                    |

## Loslegen

```bash
npm install
npm run dev      # http://localhost:3000
```

Weitere Skripte: `npm run build`, `npm run start`, `npm run lint`,
`npm run typecheck`.

Umgebungsvariablen: `.env.example` nach `.env.local` kopieren und ausfüllen.
Ohne `RESEND_API_KEY` funktioniert das Kontaktformular weiterhin – die Anfrage
wird dann serverseitig protokolliert statt per Mail verschickt.

## Projektstruktur

```
app/                    Routen (App Router)
  layout.tsx            Root-Layout: Schriften, Metadaten, Canvas, Navigation
  page.tsx              Startseite – Reihenfolge der Sektionen
  api/kontakt/route.ts  Endpunkt des Kontaktformulars
  impressum|datenschutz|agb/
components/
  canvas/               Three.js & Scroll-Video-Logik
    scroll-video-canvas.tsx   Fixierter Hintergrund, an den Scroll gekoppelt
    procedural-iceberg.ts     Prozedurale Eisberg-Szene (Platzhalter-Renderer)
    use-image-sequence.ts     Vorlader für Bildsequenzen
    diamond-scene.tsx         R3F-Szene des Diamanten
    hero-diamond.tsx          Lazy-Wrapper mit Vektor-Fallback
  layout/               Navigation, Footer, Smooth-Scroll-Provider
  sections/             Hero, Eisberg-Story, Leistungen, CTA, Über uns,
                        Referenzen, Kontakt
  ui/                   Wiederverwendbare Bausteine (Magic-UI-Stil)
hooks/                  useGsapScroll, useScrollProgress, useSmoothScroll, …
lib/
  gsap.ts               Zentrale GSAP-/Plugin-Registrierung
  site-config.ts        Sämtliche Inhalte: Navigation, Story-Beats, Leistungen
  scroll-media.ts       Quelle des Scroll-Hintergrunds
  scroll-progress.ts    Pub/Sub für den Scroll-Fortschritt
```

## Inhalte pflegen

Fast alle Texte liegen in **`lib/site-config.ts`**: Navigation, Leistungen,
Kennzahlen, Referenzen, Branchen, Rechtslinks – und die Story-Beats des
Eisbergs. Ein neuer Beat besteht aus Zeile, optionalem Fliesstext und seinem
Fortschrittsfenster:

```ts
{
  id: "beat-neu",
  kicker: "Unter der Oberfläche",
  line: "Neue Aussage mit Hervorhebung.",
  emphasis: "Hervorhebung",   // wird farblich abgesetzt
  body: "Erläuternder Satz.",
  start: 0.4,                 // 0–1 innerhalb der Story-Sektion
  end: 0.62,                  // darf sich mit dem nächsten Beat überlappen
  depth: "deep",
}
```

Die Scrollhöhe der Sektion (`h-[560vh]` in
`components/sections/iceberg-story.tsx`) sollte mit der Anzahl der Beats
mitwachsen – als Faustregel ein Viewport pro Beat plus etwas Auslauf.

## Den Scroll-Hintergrund austauschen

Aktuell zeichnet `procedural-iceberg.ts` die Szene live – die Seite läuft also
vollständig ohne fertiges Video. Sobald das echte Material vorliegt, genügt es,
`scrollMedia` in **`lib/scroll-media.ts`** umzustellen. Die Scroll-Mechanik
bleibt unverändert.

### Variante A – Bildsequenz (empfohlen)

Butterweiches Scrubbing, weil kein Video-Seek nötig ist.

1. Frames nach `public/sequence/frames/` legen, fortlaufend nummeriert
   (`eisberg_0001.webp` …). Empfehlung: 120–240 Frames, ca. 1600 px breit, WebP.
2. In `lib/scroll-media.ts`:

```ts
export const scrollMedia: ScrollMediaSource = {
  kind: "frames",
  count: 180,
  src: (i) => `/sequence/frames/eisberg_${String(i + 1).padStart(4, "0")}.webp`,
};
```

Der Ordner ist in `.gitignore` ausgenommen – Sequenzen gehören nicht ins
Repository, sondern auf ein CDN oder in den Build-Artefakt-Upload.

### Variante B – Video

Kleinster Download, dafür browserabhängiges Seek-Verhalten.

1. Datei nach `public/sequence/eisberg.mp4` legen. Für sauberes Scrubbing ohne
   B-Frames und mit kurzem Keyframe-Intervall enkodieren:

```bash
ffmpeg -i quelle.mov -an -c:v libx264 -crf 22 -g 1 -bf 0 \
  -pix_fmt yuv420p -movflags +faststart public/sequence/eisberg.mp4
```

2. In `lib/scroll-media.ts`:

```ts
export const scrollMedia: ScrollMediaSource = {
  kind: "video",
  src: "/sequence/eisberg.mp4",
  poster: "/sequence/eisberg-poster.jpg",
};
```

## Weitere Magic-UI-Komponenten ergänzen

`components/ui` folgt der Magic-UI-Konvention (Copy-and-paste-Komponenten,
`cn()`-Helfer aus `lib/utils.ts`, Animationen als Tailwind-Keyframes im
`@theme`-Block von `app/globals.css`). Neue Komponenten aus dem Magic-UI-
Katalog lassen sich daher direkt in diesen Ordner kopieren; benötigte
Keyframes werden in `globals.css` ergänzt.

Bereits vorhanden: `BlurFade`, `BorderBeam`, `Marquee`, `NumberTicker`,
`Particles`, `GridPattern`, `AnimatedShinyText`, `PulseCta`, `Button`,
`SectionHeading`, `DiamondLogo`.

## Barrierefreiheit & Performance

- `prefers-reduced-motion` wird respektiert: Smooth-Scrolling, Partikel und die
  Story-Timeline werden abgeschaltet, die Beats stehen dann untereinander.
- Der Canvas-Hintergrund zeichnet maximal einmal pro Frame (GSAP-Ticker) und
  begrenzt die Pixeldichte auf DPR 2.
- Die Three.js-Szene wird erst nach dem ersten Paint und nur bei vorhandener
  WebGL-Unterstützung geladen; sonst greift die SVG-Version des Diamanten.
- Schriften werden über `next/font` zur Bauzeit eingebunden und selbst
  ausgeliefert – keine Verbindung zu Google beim Seitenaufruf.

## Offene Punkte vor dem Livegang

- [ ] Impressum, Datenschutzerklärung und AGB enthalten Platzhalter und müssen
      durch geprüfte Texte ersetzt werden.
- [ ] Echte Kontaktdaten in `lib/site-config.ts` eintragen.
- [ ] Referenzen (`references`) durch freigegebene Kundenprojekte ersetzen.
- [ ] Eisberg-Video bzw. Bildsequenz produzieren und einbinden.
- [ ] OpenGraph-Bild (`app/opengraph-image.png`) ergänzen.
