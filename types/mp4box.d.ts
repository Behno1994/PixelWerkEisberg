/**
 * Minimale Typdeklaration für `mp4box` (v0.5.x liefert keine eigenen Typen).
 *
 * Deklariert ist nur, was `hooks/use-video-scrub.ts` tatsächlich benutzt:
 * Demuxen einer MP4-Datei, Auslesen der `avcC`/`hvcC`-Beschreibung für die
 * VideoDecoder-Konfiguration und der Sample-Callback.
 */
declare module "mp4box" {
  export interface MP4MediaTrack {
    id: number;
    type: string;
    codec: string;
    /** Zeitbasis der Track-Zeitstempel (Ticks pro Sekunde). */
    timescale: number;
    /** Dauer in `timescale`-Einheiten. */
    duration: number;
    nb_samples: number;
    video?: { width: number; height: number };
  }

  export interface MP4Info {
    duration: number;
    timescale: number;
    tracks: MP4MediaTrack[];
    videoTracks: MP4MediaTrack[];
  }

  export interface MP4Sample {
    number: number;
    /** Decode-Zeitstempel in `timescale`-Einheiten. */
    dts: number;
    /** Composition-(Anzeige-)Zeitstempel in `timescale`-Einheiten. */
    cts: number;
    duration: number;
    timescale: number;
    is_sync: boolean;
    data: Uint8Array;
  }

  export interface MP4ArrayBuffer extends ArrayBuffer {
    /** Byte-Offset dieses Chunks in der Gesamtdatei. */
    fileStart: number;
  }

  /** Ausschnitt der Box-Struktur, die für `avcC`/`hvcC` gebraucht wird. */
  export interface MP4Box {
    write(stream: DataStream): void;
    size: number;
  }

  export interface MP4Track {
    id: number;
    mdia: {
      minf: {
        stbl: {
          stsd: {
            entries: Array<{ avcC?: MP4Box; hvcC?: MP4Box; vpcC?: MP4Box; av1C?: MP4Box }>;
          };
        };
      };
    };
  }

  export interface MP4File {
    onReady?: (info: MP4Info) => void;
    onError?: (error: string) => void;
    onSamples?: (trackId: number, user: unknown, samples: MP4Sample[]) => void;
    appendBuffer(data: MP4ArrayBuffer): number;
    start(): void;
    stop(): void;
    flush(): void;
    setExtractionOptions(
      trackId: number,
      user?: unknown,
      options?: { nbSamples?: number; rapAlignement?: boolean },
    ): void;
    getTrackById(id: number): MP4Track | undefined;
  }

  export class DataStream {
    constructor(arrayBuffer?: ArrayBuffer, byteOffset?: number, endianness?: boolean);
    static BIG_ENDIAN: boolean;
    static LITTLE_ENDIAN: boolean;
    buffer: ArrayBuffer;
    /** Schreibposition; nach `box.write()` die Länge der Box in Bytes. */
    position: number;
  }

  export function createFile(): MP4File;
}
