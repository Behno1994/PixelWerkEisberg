/**
 * Quelle des Videohintergrunds der Kino-Szene.
 *
 * Zwei Betriebsarten – die Scroll-Mechanik ist identisch, nur das Zeichnen
 * unterscheidet sich:
 *
 *  - **Kein Video** (`null`, aktueller Stand): Die Eisberg-Szene wird live auf
 *    das Canvas gezeichnet. Die Seite funktioniert dadurch vollständig, bevor
 *    das eigentliche Videomaterial vorliegt.
 *  - **Video gesetzt**: `hooks/use-video-scrub.ts` demuxt die Datei mit MP4Box,
 *    dekodiert sie über WebCodecs und zeichnet die Frames aufs Canvas. Fehlt
 *    WebCodecs oder scheitert das Demuxen, wird auf `currentTime`-Seeking
 *    zurückgefallen und das `<video>`-Element scheint durch.
 *
 * Für sauberes Scrubbing ohne B-Frames und mit kurzem Keyframe-Intervall
 * enkodieren:
 *
 *   ffmpeg -i quelle.mov -an -c:v libx264 -crf 22 -g 1 -bf 0 \
 *     -pix_fmt yuv420p -movflags +faststart public/sequence/eisberg.mp4
 *
 * Wichtig für die Bildwirkung: Das Material sollte hell („high key") beginnen
 * und zur Tiefe hin abdunkeln – die Textstufen wechseln bei p ≈ 0.55 von
 * dunkler auf helle Schrift.
 */
export type SceneVideo = {
  src: string;
};

/** Aktive Quelle. `null` aktiviert die prozedurale Szene. */
export const sceneVideo: SceneVideo | null = null;

/**
 * Beispielkonfiguration – einsetzen, sobald das Video vorliegt:
 *
 * export const sceneVideo: SceneVideo | null = { src: "/sequence/eisberg.mp4" };
 */
