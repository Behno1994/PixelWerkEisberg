# Scroll-Sequenz

Hier liegen die Assets für den seitenweiten Scroll-Hintergrund.

- `frames/` – Bildsequenz (`eisberg_0001.webp` …). Der Ordner ist bewusst in
  `.gitignore` ausgenommen: Mehrere hundert Einzelbilder gehören nicht ins
  Repository, sondern auf ein CDN oder in den Deployment-Upload.
- `eisberg.mp4` / `eisberg-poster.jpg` – Alternative als einzelne Videodatei.

Aktiviert wird die Quelle in `lib/scroll-media.ts`. Solange dort
`{ kind: "procedural" }` steht, wird die Szene live gezeichnet und es werden
keine Assets benötigt.

Details zu Export-Einstellungen: siehe README im Projektwurzelverzeichnis.
