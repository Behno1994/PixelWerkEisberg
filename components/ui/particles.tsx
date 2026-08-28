"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type ParticlesProps = {
  className?: string;
  /** Anzahl Partikel bei Standardgrösse; skaliert mit der Fläche. */
  quantity?: number;
  /** Aufstiegsgeschwindigkeit in px/Frame. Negativ = sinkend. */
  speed?: number;
  color?: string;
  /** Wie stark die Partikel dem Mauszeiger folgen (0 = gar nicht). */
  parallax?: number;
  size?: number;
};

type Particle = {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  targetAlpha: number;
  drift: number;
  rise: number;
  /** Phase der seitlichen Schlingerbewegung. */
  wobble: number;
};

/**
 * Aufsteigende Luftblasen als Canvas-Partikelfeld.
 *
 * Läuft in einem eigenen `requestAnimationFrame`-Loop statt über React-State –
 * bei mehreren hundert Partikeln ist alles andere zu teuer. Der Loop pausiert
 * automatisch, wenn das Element aus dem Viewport scrollt oder der Nutzer
 * reduzierte Bewegung angefordert hat.
 */
export function Particles({
  className,
  quantity = 80,
  speed = 0.28,
  color = "#9fdcf5",
  parallax = 12,
  size = 1.6,
}: ParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number | undefined>(undefined);
  const dprRef = useRef(1);

  const rgb = hexToRgb(color);

  const createParticle = useCallback(
    (width: number, height: number, atBottom = false): Particle => ({
      x: Math.random() * width,
      y: atBottom ? height + Math.random() * 40 : Math.random() * height,
      radius: Math.random() * size + 0.4,
      alpha: 0,
      targetAlpha: Number((Math.random() * 0.5 + 0.12).toFixed(2)),
      drift: (Math.random() - 0.5) * 0.15,
      rise: Math.random() * 0.6 + 0.5,
      wobble: Math.random() * Math.PI * 2,
    }),
    [size],
  );

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!container || !canvas || !ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let visible = true;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      // Auf 2 begrenzt: darüber kostet das Neuzeichnen mehr, als es sichtbar bringt.
      dprRef.current = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = width * dprRef.current;
      canvas.height = height * dprRef.current;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);

      const count = Math.round((quantity * width * height) / (1440 * 900));
      particlesRef.current = Array.from({ length: Math.max(12, count) }, () =>
        createParticle(width, height),
      );
    };

    const onPointerMove = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: (event.clientX - rect.left - width / 2) / (width / 2),
        y: (event.clientY - rect.top - height / 2) / (height / 2),
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      for (const p of particlesRef.current) {
        p.alpha += (p.targetAlpha - p.alpha) * 0.03;

        if (!reduced) {
          p.wobble += 0.02;
          p.y -= speed * p.rise;
          p.x += p.drift + Math.sin(p.wobble) * 0.22;
        }

        // Oben ausgetreten → unten neu einsetzen (endloser Aufstieg).
        if (p.y + p.radius < 0) {
          Object.assign(p, createParticle(width, height, true));
        }
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;

        const ox = mouseRef.current.x * parallax * p.rise;
        const oy = mouseRef.current.y * parallax * p.rise;

        ctx.beginPath();
        ctx.arc(p.x + ox, p.y + oy, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb}, ${p.alpha})`;
        ctx.fill();
      }

      rafRef.current = window.requestAnimationFrame(draw);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && rafRef.current === undefined) {
          rafRef.current = window.requestAnimationFrame(draw);
        } else if (!visible && rafRef.current !== undefined) {
          window.cancelAnimationFrame(rafRef.current);
          rafRef.current = undefined;
        }
      },
      { rootMargin: "120px" },
    );

    const resizeObserver = new ResizeObserver(resize);

    resize();
    observer.observe(container);
    resizeObserver.observe(container);
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    rafRef.current = window.requestAnimationFrame(draw);

    return () => {
      if (rafRef.current !== undefined) window.cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, [quantity, speed, parallax, rgb, createParticle]);

  return (
    <div ref={containerRef} aria-hidden className={cn("pointer-events-none", className)}>
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}

/** `#rrggbb` → `"r, g, b"`. Fällt bei ungültiger Eingabe auf Eisblau zurück. */
function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;

  if (full.length !== 6) return "159, 220, 245";

  const int = Number.parseInt(full, 16);
  return `${(int >> 16) & 255}, ${(int >> 8) & 255}, ${int & 255}`;
}
