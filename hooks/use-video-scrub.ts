"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * Bildgenaues Scrubbing eines Videos entlang der Scroll-Position.
 *
 * Zwei Betriebsarten, die zur Laufzeit gewählt werden:
 *
 *  1. **WebCodecs** (bevorzugt) – MP4Box demuxt die Datei, ein `VideoDecoder`
 *     dekodiert die Samples und die fertigen Frames landen in einer LRU-Bank.
 *     Gezeichnet wird direkt auf ein Canvas. Ergebnis: echtes Frame-Scrubbing
 *     ohne Seek-Latenz, auch rückwärts.
 *
 *  2. **`currentTime`-Seek** (Fallback) – wenn WebCodecs fehlt, das Demuxen
 *     scheitert oder der Watchdog zuschlägt. Deutlich ruckeliger, funktioniert
 *     aber überall.
 *
 * Die Scroll-Position wird nie direkt übernommen, sondern per LERP gedämpft
 * (`LERP_TAU`), damit Mausrad-Sprünge nicht als Ruck durchschlagen. Unterhalb
 * von `SNAP` gilt das Ziel als erreicht und der Loop rechnet nicht weiter.
 */

/** Dämpfung der Annäherung an die Zielposition (grösser = strafferer Lauf). */
const LERP_TAU = 8;
/** Abstand, ab dem die Zielposition als erreicht gilt. */
const SNAP = 0.002;
/** Maximale Anzahl dekodierter Frames im Speicher. */
const LRU_MAX = 24;
/** Zeit ohne ersten dekodierten Frame, nach der auf Seeking umgeschaltet wird. */
const WATCHDOG_MS = 6000;

export type VideoScrubMode = "webcodecs" | "seek" | "idle";

type UseVideoScrubOptions = {
  /** Quelle des Videos. `undefined` deaktiviert den Hook vollständig. */
  src?: string;
  /** Liefert die Zielposition 0–1. Wird pro Frame abgefragt. */
  getProgress: () => number;
  /** Wird gerufen, sobald die Betriebsart feststeht oder wechselt. */
  onModeChange?: (mode: VideoScrubMode) => void;
};

export type VideoScrubHandles = {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
};

/** Ein dekodierter Frame samt Anzeigezeitpunkt in Sekunden. */
type BankedFrame = { timestamp: number; frame: VideoFrame };

export function useVideoScrub({
  src,
  getProgress,
  onModeChange,
}: UseVideoScrubOptions): VideoScrubHandles {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const modeRef = useRef<VideoScrubMode>("idle");
  const onModeChangeRef = useRef(onModeChange);
  const getProgressRef = useRef(getProgress);

  useEffect(() => {
    onModeChangeRef.current = onModeChange;
    getProgressRef.current = getProgress;
  });

  const setMode = useCallback((mode: VideoScrubMode) => {
    if (modeRef.current === mode) return;
    modeRef.current = mode;
    onModeChangeRef.current?.(mode);
  }, []);

  useEffect(() => {
    if (!src) {
      setMode("idle");
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d", { alpha: false });

    /** Nach Anzeigezeit sortierte Frame-Bank (LRU nach Zugriff). */
    const bank: BankedFrame[] = [];
    /** Zuletzt gezeichneter Zeitstempel – vermeidet identische Redraws. */
    let lastDrawn = -1;
    /** Videolänge in Sekunden; aus dem Container oder dem Element. */
    let duration = 0;
    let decoder: VideoDecoder | null = null;
    let cancelled = false;
    let rafId = 0;
    let lastTime = performance.now();
    let current = getProgressRef.current();

    const releaseBank = () => {
      for (const entry of bank) entry.frame.close();
      bank.length = 0;
    };

    /** Fügt einen Frame ein und wirft bei Überlauf den ältesten weg. */
    const bankFrame = (frame: VideoFrame) => {
      const timestamp = (frame.timestamp ?? 0) / 1_000_000;
      bank.push({ timestamp, frame });
      bank.sort((a, b) => a.timestamp - b.timestamp);

      while (bank.length > LRU_MAX) {
        // Den Frame verwerfen, der am weitesten von der aktuellen Position
        // entfernt liegt – nicht einfach den ältesten: Beim Rückwärtsscrollen
        // wären das genau die Frames, die als Nächstes gebraucht werden.
        const target = current * duration;
        let worst = 0;
        let worstDistance = -1;
        for (let i = 0; i < bank.length; i++) {
          const distance = Math.abs(bank[i].timestamp - target);
          if (distance > worstDistance) {
            worstDistance = distance;
            worst = i;
          }
        }
        bank.splice(worst, 1)[0].frame.close();
      }
    };

    /** Zeichnet den Frame, der `time` am nächsten liegt. */
    const drawNearest = (time: number) => {
      if (!ctx || bank.length === 0) return false;

      let best = bank[0];
      let bestDistance = Math.abs(best.timestamp - time);
      for (const entry of bank) {
        const distance = Math.abs(entry.timestamp - time);
        if (distance < bestDistance) {
          bestDistance = distance;
          best = entry;
        }
      }

      if (best.timestamp === lastDrawn) return true;
      lastDrawn = best.timestamp;

      const { width, height } = canvas!;
      ctx.drawImage(best.frame, 0, 0, width, height);
      return true;
    };

    /** Fallback: Position über `video.currentTime` anfahren. */
    const seekTo = (time: number) => {
      const video = videoRef.current;
      if (!video || !Number.isFinite(video.duration)) return;
      // Nur seeken, wenn es sich lohnt – jeder Seek stösst eine Dekodierung an.
      if (Math.abs(video.currentTime - time) > 1 / 30) {
        video.currentTime = time;
      }
    };

    const tick = (now: number) => {
      if (cancelled) return;

      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      const target = getProgressRef.current();
      // Frameraten-unabhängige exponentielle Annäherung.
      current += (target - current) * (1 - Math.exp(-LERP_TAU * delta));
      if (Math.abs(target - current) < SNAP) current = target;

      if (duration > 0) {
        const time = current * duration;
        if (modeRef.current === "webcodecs") {
          if (!drawNearest(time)) seekTo(time);
        } else {
          seekTo(time);
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    /**
     * Demuxt die Datei und startet den Decoder.
     * Wirft bei jedem Problem – der Aufrufer fällt dann auf Seeking zurück.
     */
    const startWebCodecs = async () => {
      if (typeof VideoDecoder === "undefined" || !ctx) {
        throw new Error("WebCodecs nicht verfügbar");
      }

      const { createFile, DataStream } = await import("mp4box");
      const file = createFile();

      const config = await new Promise<{
        config: VideoDecoderConfig;
        trackId: number;
        timescale: number;
      }>((resolve, reject) => {
        file.onError = (error) => reject(new Error(error));

        file.onReady = (info) => {
          const track = info.videoTracks[0];
          if (!track) return reject(new Error("Kein Video-Track gefunden"));

          duration = track.duration / track.timescale;

          // Die Decoder-Konfiguration steckt in der `avcC`/`hvcC`-Box des
          // Sample-Descriptors und muss als rohe Bytes übergeben werden.
          const entry = file.getTrackById(track.id)?.mdia.minf.stbl.stsd.entries[0];
          const box = entry?.avcC ?? entry?.hvcC ?? entry?.vpcC ?? entry?.av1C;
          if (!box) return reject(new Error("Keine Codec-Konfiguration gefunden"));

          const stream = new DataStream(undefined, 0, DataStream.BIG_ENDIAN);
          box.write(stream);
          // Die ersten 8 Byte sind der Box-Header (size + type).
          const description = new Uint8Array(stream.buffer, 8);

          resolve({
            config: {
              codec: track.codec,
              codedWidth: track.video?.width,
              codedHeight: track.video?.height,
              description,
              hardwareAcceleration: "prefer-hardware",
            },
            trackId: track.id,
            timescale: track.timescale,
          });
        };

        void (async () => {
          try {
            const response = await fetch(src);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const buffer = (await response.arrayBuffer()) as ArrayBuffer & {
              fileStart: number;
            };
            buffer.fileStart = 0;
            file.appendBuffer(buffer);
            file.flush();
          } catch (cause) {
            reject(cause instanceof Error ? cause : new Error(String(cause)));
          }
        })();
      });

      const support = await VideoDecoder.isConfigSupported(config.config);
      if (!support.supported) throw new Error("Codec wird nicht unterstützt");

      decoder = new VideoDecoder({
        output: (frame) => {
          if (cancelled) {
            frame.close();
            return;
          }
          bankFrame(frame);
          setMode("webcodecs");
        },
        error: () => setMode("seek"),
      });
      decoder.configure(config.config);

      file.onSamples = (_trackId, _user, samples) => {
        if (cancelled || !decoder) return;
        for (const sample of samples) {
          decoder.decode(
            new EncodedVideoChunk({
              type: sample.is_sync ? "key" : "delta",
              timestamp: (sample.cts / sample.timescale) * 1_000_000,
              duration: (sample.duration / sample.timescale) * 1_000_000,
              data: sample.data,
            }),
          );
        }
      };

      file.setExtractionOptions(config.trackId, null, { nbSamples: LRU_MAX });
      file.start();
    };

    // Watchdog: Kommt in dieser Zeit kein Frame an, läuft die Seite im
    // Fallback weiter statt auf einen hängenden Decoder zu warten.
    const watchdog = window.setTimeout(() => {
      if (modeRef.current !== "webcodecs") setMode("seek");
    }, WATCHDOG_MS);

    const video = videoRef.current;
    const onMetadata = () => {
      if (video && Number.isFinite(video.duration)) duration = video.duration;
    };
    video?.addEventListener("loadedmetadata", onMetadata);

    setMode("seek");
    startWebCodecs().catch(() => setMode("seek"));
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      window.clearTimeout(watchdog);
      cancelAnimationFrame(rafId);
      video?.removeEventListener("loadedmetadata", onMetadata);
      releaseBank();
      if (decoder && decoder.state !== "closed") decoder.close();
      decoder = null;
    };
  }, [src, setMode]);

  return { videoRef, canvasRef };
}
