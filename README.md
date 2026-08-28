# Pixel Werk

Webauftritt der Webagentur **Pixel Werk** – spezialisiert auf Industrie,
Maschinenbau, Stahlbau und Metallbau.

Kern der Seite ist eine **Kino-Szene**: ein 500vh hoher Scrolltrack, dessen
Inhalt bildfüllend im Viewport klebt. Das Bild fährt beim Scrollen von der
hellen Wasseroberfläche in die dunkle Tiefsee, während drei Textstufen
nacheinander erscheinen und wieder verschwinden.

## Stack

| Bereich       | Technologie                                              |
| ------------- | -------------------------------------------------------- |
| Framework     | Next.js 16 (App Router, React 19, TypeScript)             |
| Styling       | Tailwind CSS v4 (`@theme`-Tokens, keine Config-Datei)     |
| Scroll-Video  | WebCodecs `VideoDecoder` + MP4Box, Fallback auf Seeking   |
| Animation     | GSAP 3 + ScrollTrigger, Lenis (Smooth Scroll)             |
| 3D            | three.js, React Three Fiber, drei                         |
| UI-Bausteine  | Magic-UI-kompatible Komponenten in `components/ui`        |
| Icons         | lucide-react                                              |

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
  layout.tsx            Root-Layout: Pixelschrift, Metadaten, Navigation
  page.tsx              Startseite – Reihenfolge der Sektionen
  api/kontakt/route.ts  Endpunkt des Kontaktformulars
  impressum|datenschutz|agb/
components/
  canvas/               Kino-Szene, Three.js
    cinematic-scene.tsx       500vh-Track, Sticky-Bühne, die drei Textstufen
    procedural-iceberg.ts     Prozedurale Eisberg-Szene (Platzhalter-Renderer)
    diamond-scene.tsx         R3F-Szene des Diamanten
    hero-diamond.tsx          Lazy-Wrapper mit Vektor-Fallback
  layout/               Navigation, Footer, Fortschrittsbalken, Provider
  sections/             Maschinenbau, Leistungen, CTA, Über uns,
                        Referenzen, Kontakt
  ui/                   Wiederverwendbare Bausteine (Magic-UI-Stil)
hooks/
  use-video-scrub.ts    WebCodecs-Scrubbing mit MP4Box + Seek-Fallback
  use-gsap-scroll.ts    GSAP-Setup im `gsap.context`
  use-smooth-scroll.ts  Lenis, an den GSAP-Ticker gekoppelt
lib/
  gsap.ts               Zentrale GSAP-/Plugin-Registrierung
  site-config.ts        Sämtliche Inhalte: Navigation, Leistungen, Referenzen
  scroll-media.ts       Quelle des Videohintergrunds
  scroll-progress.ts    Pub/Sub für den Fortschritt der Kino-Szene
types/mp4box.d.ts       Typdeklaration für MP4Box (liefert keine eigenen)
```

## Die Kino-Szene

`components/canvas/cinematic-scene.tsx` ist der Kern. Aufbau:

- **Aussen** `relative h-[500vh]` – gibt die Scrollstrecke vor.
- **Innen** `sticky top-0 h-screen overflow-hidden` – die Bühne.
- Darin drei Ebenen: `<video>` (Rückfallebene), `<canvas width=1920
  height=1080>` (zeichnet die Frames) und ein Overlay mit den Textstufen.

Der Fortschritt ist `p = clamp(0, 1, (scrollY − track.offsetTop) / (trackHöhe −
Viewporthöhe))`. Er wird pro Frame berechnet, in den `sceneProgress`-Store
geschrieben (davon liest die Navigation ihren Farbwechsel) und gedämpft an die
Bildausgabe weitergereicht.

### Die drei Textstufen

Streng sequentiell – eine Stufe ist vollständig ausgeblendet, bevor die nächste
erscheint:

| Stufe | Ein         | Hält        | Aus         |
| ----- | ----------- | ----------- | ----------- |
| 1     | ab Beginn   | bis 0.20    | 0.20 – 0.28 |
| 2     | 0.32 – 0.40 | bis 0.55    | 0.55 – 0.63 |
| 3     | 0.67 – 0.75 | bis Ende    | –           |

Die Deckkraft wird imperativ auf die DOM-Knoten geschrieben, nicht über
React-State: Bei 60–120 Bildern pro Sekunde wäre ein Re-Render pro Frame zu
teuer. React hält nur die grobe Information, welche Stufe gerade aktiv ist –
daran hängt der gestaffelte Auftritt der Kindelemente (`components/ui/stagger.tsx`).

### Helligkeitsverlauf

Der Umschlagpunkt liegt bei **p = 0.55** (`LIGHT_TO_DARK`). Davor ist das Bild
hell („high key") und die Schrift dunkel, danach ist das Bild dunkel und die
Schrift weiss. Die Navigation folgt demselben Punkt. Der prozedurale Renderer
blendet sein Lichtniveau passend dazu zwischen p = 0.50 und p = 0.78 ab – also
genau in der textfreien Lücke zwischen Stufe 2 und 3.

**Wichtig beim Austausch gegen echtes Videomaterial:** Das Video muss demselben
Verlauf folgen – hell beginnen, zur Tiefe hin abdunkeln. Sonst steht die
Schrift auf der falschen Helligkeit.

## Video einbinden

Aktuell zeichnet `procedural-iceberg.ts` die Szene live – die Seite läuft also
vollständig ohne Videomaterial. Sobald es vorliegt:

1. Datei nach `public/sequence/eisberg.mp4` legen. Für sauberes Scrubbing ohne
   B-Frames und mit kurzem Keyframe-Intervall enkodieren:

   ```bash
   ffmpeg -i quelle.mov -an -c:v libx264 -crf 22 -g 1 -bf 0 \
     -pix_fmt yuv420p -movflags +faststart public/sequence/eisberg.mp4
   ```

2. In `lib/scroll-media.ts`:

   ```ts
   export const sceneVideo: SceneVideo | null = { src: "/sequence/eisberg.mp4" };
   ```

### Wie das Scrubbing arbeitet

`hooks/use-video-scrub.ts` wählt zur Laufzeit zwischen zwei Wegen:

1. **WebCodecs** (bevorzugt) – MP4Box demuxt die Datei, ein `VideoDecoder`
   dekodiert die Samples, die Frames landen in einer LRU-Bank (`LRU_MAX = 24`)
   und werden aufs Canvas gezeichnet. Verworfen wird jeweils der Frame, der am
   weitesten von der aktuellen Position entfernt liegt – beim Rückwärtsscrollen
   wären die ältesten genau die, die als Nächstes gebraucht werden.
2. **`currentTime`-Seek** (Fallback) – wenn WebCodecs fehlt, das Demuxen
   scheitert oder nach `WATCHDOG_MS` kein Frame angekommen ist. Dann scheint
   das `<video>`-Element durch und das Canvas wird ausgeblendet.

Die Scroll-Position wird nie hart übernommen, sondern per LERP gedämpft
(`LERP_TAU = 8`, `SNAP = 0.002`), damit Mausrad-Sprünge nicht durchschlagen.

## Inhalte pflegen

Fast alle Texte liegen in **`lib/site-config.ts`**: Navigation, Leistungen,
Kennzahlen, Referenzen, Branchen, Rechtslinks. Die Copy der drei Textstufen
steht direkt in `cinematic-scene.tsx`, weil sie eng an Layout und Timing hängt.

## Barrierefreiheit & Performance

- `prefers-reduced-motion` wird respektiert: Smooth-Scrolling entfällt, GSAP-
  Reveals springen in den Endzustand (GSAP animiert Inline-Styles und wird von
  der CSS-Regel nicht erfasst – die Tweens prüfen die Einstellung selbst).
- Der rAF-Loop der Szene pausiert, sobald sie aus dem Viewport scrollt.
- Die Three.js-Szene wird erst nach dem ersten Paint und nur bei vorhandener
  WebGL-Unterstützung geladen; sonst greift die SVG-Version des Diamanten.
- Fliesstext und Überschriften laufen über die Systemschrift – nur die
  Pixel-Wortmarke lädt eine Webschrift.

## Offene Punkte vor dem Livegang

- [ ] Impressum, Datenschutzerklärung und AGB enthalten Platzhalter und müssen
      durch geprüfte Texte ersetzt werden.
- [ ] Echte Kontaktdaten in `lib/site-config.ts` eintragen.
- [ ] Referenzen (`references`) durch freigegebene Kundenprojekte ersetzen.
- [ ] Eisberg-Video produzieren (hell beginnend, zur Tiefe abdunkelnd) und
      in `lib/scroll-media.ts` aktivieren.
- [ ] OpenGraph-Bild (`app/opengraph-image.png`) ergänzen.
