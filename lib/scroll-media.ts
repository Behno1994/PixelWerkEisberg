/**
 * Quelle des seitenweiten Scroll-Hintergrunds.
 *
 * Drei Betriebsarten – die Scroll-Mechanik ist identisch, nur das Zeichnen
 * unterscheidet sich:
 *
 *  - `procedural`  Kein Asset nötig. Die Eisberg-Szene wird live auf das Canvas
 *                  gezeichnet. Das ist der aktuelle Stand, damit die Seite ohne
 *                  fertiges Video vollständig funktioniert.
 *  - `frames`      Bildsequenz (z. B. aus Blender/AE exportiert). Butterweiches
 *                  Scrubbing, weil kein Video-Seek nötig ist – dafür grösserer
 *                  Download. Empfohlen: 120–240 WebP-Frames à ~1600 px Breite.
 *  - `video`       Eine einzelne Videodatei, deren `currentTime` an den Scroll
 *                  gekoppelt wird. Kleinster Download, aber Seek-Verhalten ist
 *                  je nach Browser/Codec ruckeliger. Video ohne B-Frames und
 *                  mit kurzem Keyframe-Intervall (z. B. `-g 1`) exportieren.
 *
 * Zum Umstellen genügt es, `scrollMedia` auf eine andere Variante zu setzen.
 */
export type ScrollMediaSource =
  | { kind: "procedural" }
  | {
      kind: "frames";
      /** Anzahl der Einzelbilder. */
      count: number;
      /** Baut den Pfad zum Frame-Index (0-basiert). */
      src: (index: number) => string;
    }
  | {
      kind: "video";
      src: string;
      /** Standbild für den ersten Frame (verhindert schwarzen Blitz). */
      poster?: string;
    };

/** Aktive Quelle. */
export const scrollMedia: ScrollMediaSource = { kind: "procedural" };

/**
 * Beispielkonfigurationen – eine davon oben einsetzen, sobald Assets vorliegen:
 *
 * export const scrollMedia: ScrollMediaSource = {
 *   kind: "frames",
 *   count: 180,
 *   src: (i) => `/sequence/frames/eisberg_${String(i + 1).padStart(4, "0")}.webp`,
 * };
 *
 * export const scrollMedia: ScrollMediaSource = {
 *   kind: "video",
 *   src: "/sequence/eisberg.mp4",
 *   poster: "/sequence/eisberg-poster.jpg",
 * };
 */
