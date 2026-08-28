/**
 * Prozedurale Eisberg-Szene.
 *
 * Zeichnet die Kamerafahrt von der Wasseroberfläche in die Tiefsee direkt auf
 * ein 2D-Canvas – ohne Video, ohne Bildsequenz. Damit ist die Scrollytelling-
 * Mechanik vollständig testbar, bevor das eigentliche Rendering vorliegt; die
 * Signatur entspricht der eines Frame-Renderers, sodass sie später 1:1 durch
 * `drawImage` ersetzt werden kann.
 *
 * Weltkoordinaten sind in Vielfachen der Viewport-Höhe angegeben: Die Szene ist
 * `WORLD_HEIGHT` Viewports hoch, die Kamera fährt über den Scroll-Fortschritt
 * von oben nach unten hindurch.
 */

/** Höhe der Szene in Viewport-Höhen. */
const WORLD_HEIGHT = 3.4;
/** Position der Wasseroberfläche in Weltkoordinaten. */
const WATER_LINE = 0.58;

/** Deterministischer Pseudo-Zufall – gleiche Silhouette in jedem Frame. */
function noise(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

/**
 * Silhouette des Eisbergs in normalisierten Weltkoordinaten.
 * `x` ist relativ zur Breite (0–1), `y` relativ zur Viewport-Höhe.
 */
function icebergPath(width: number, height: number, cameraY: number): Path2D {
  const path = new Path2D();
  // Rechts der Mitte: Die linke Bildhälfte bleibt dunkles Wasser und trägt
  // die Scrollytelling-Texte, ohne dass ein Abdunkler nötig wäre.
  const cx = width * 0.62;
  const px = (n: number) => cx + n * width * 0.86;
  const py = (n: number) => n * height - cameraY;

  // Spitze über Wasser – schmal und kantig.
  path.moveTo(px(-0.055), py(0.585));
  path.lineTo(px(-0.032), py(0.5));
  path.lineTo(px(-0.008), py(0.535));
  path.lineTo(px(0.014), py(0.452));
  path.lineTo(px(0.041), py(0.512));
  path.lineTo(px(0.062), py(0.5));
  path.lineTo(px(0.078), py(0.585));

  // Rechte Flanke: wächst unter Wasser stark in die Breite.
  const right: Array<[number, number]> = [
    [0.1, 0.66],
    [0.16, 0.78],
    [0.14, 0.92],
    [0.23, 1.12],
    [0.21, 1.35],
    [0.3, 1.6],
    [0.26, 1.92],
    [0.31, 2.2],
    [0.22, 2.5],
    [0.16, 2.78],
    [0.06, 3.02],
  ];
  for (const [x, y] of right) {
    const jitter = (noise(x * 91 + y * 13) - 0.5) * 0.012;
    path.lineTo(px(x + jitter), py(y));
  }

  // Kalotte / unterer Abschluss.
  path.lineTo(px(-0.03), py(3.08));

  // Linke Flanke zurück nach oben.
  const left: Array<[number, number]> = [
    [-0.14, 2.86],
    [-0.21, 2.58],
    [-0.19, 2.26],
    [-0.28, 1.98],
    [-0.24, 1.7],
    [-0.3, 1.42],
    [-0.22, 1.16],
    [-0.24, 0.94],
    [-0.15, 0.78],
    [-0.11, 0.66],
  ];
  for (const [x, y] of left) {
    const jitter = (noise(x * 57 + y * 29) - 0.5) * 0.012;
    path.lineTo(px(x + jitter), py(y));
  }

  path.closePath();
  return path;
}

/** Vertikaler Farbverlauf des Wassers, abhängig von der Kameratiefe. */
function paintWater(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cameraY: number,
) {
  const surfaceY = WATER_LINE * height - cameraY;

  // Himmel über der Oberfläche.
  if (surfaceY > 0) {
    const sky = ctx.createLinearGradient(0, Math.min(0, surfaceY - height), 0, surfaceY);
    sky.addColorStop(0, "#071523");
    sky.addColorStop(0.5, "#11364f");
    sky.addColorStop(1, "#27607f");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, Math.max(0, surfaceY));
  }

  // Wasserkörper: je tiefer, desto dunkler und gesättigter.
  const top = Math.max(0, surfaceY);
  const water = ctx.createLinearGradient(0, top, 0, height);
  water.addColorStop(0, "#12557a");
  water.addColorStop(0.16, "#0b3856");
  water.addColorStop(0.48, "#072135");
  water.addColorStop(1, "#020a14");
  ctx.fillStyle = water;
  ctx.fillRect(0, top, width, height - top);

  // Oberflächenkante mit leichtem Wellenversatz.
  if (surfaceY > -40 && surfaceY < height + 40) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, surfaceY);
    for (let x = 0; x <= width; x += 12) {
      const wave = Math.sin(x * 0.012) * 3 + Math.sin(x * 0.041) * 1.6;
      ctx.lineTo(x, surfaceY + wave);
    }
    ctx.strokeStyle = "rgba(214, 240, 255, 0.45)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Heller Schaumsaum direkt unter der Kante.
    ctx.lineWidth = 12;
    ctx.strokeStyle = "rgba(159, 220, 245, 0.12)";
    ctx.stroke();
    ctx.restore();
  }
}

/** Lichtstrahlen, die von der Oberfläche in die Tiefe fallen. */
function paintLightShafts(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cameraY: number,
  progress: number,
) {
  const surfaceY = WATER_LINE * height - cameraY;
  // Nahe der Oberfläche am hellsten, in der Tiefe praktisch weg.
  const intensity = Math.max(0, 1 - progress * 1.6);
  if (intensity <= 0.01) return;

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  for (let i = 0; i < 7; i++) {
    const x = width * (0.08 + i * 0.14 + noise(i) * 0.05);
    const spread = width * (0.03 + noise(i + 20) * 0.05);
    const shaft = ctx.createLinearGradient(x, surfaceY, x + spread * 2, height);
    shaft.addColorStop(0, `rgba(170, 225, 255, ${0.07 * intensity})`);
    shaft.addColorStop(1, "rgba(190, 235, 255, 0)");

    ctx.beginPath();
    ctx.moveTo(x - spread * 0.35, surfaceY);
    ctx.lineTo(x + spread * 0.35, surfaceY);
    ctx.lineTo(x + spread * 2.6, height);
    ctx.lineTo(x + spread * 0.9, height);
    ctx.closePath();
    ctx.fillStyle = shaft;
    ctx.fill();
  }

  ctx.restore();
}

/** Der Eisberg selbst: Körper, Facetten, Tiefenabfall und Streulicht-Saum. */
function paintIcebergBody(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cameraY: number,
) {
  const surfaceY = WATER_LINE * height - cameraY;
  const path = icebergPath(width, height, cameraY);

  // Grundkörper. Der Verlauf ist in Weltkoordinaten verankert (nicht am
  // Bildschirm), damit dieselbe Stelle des Eisbergs beim Scrollen ihre Farbe
  // behält – sonst „atmet“ der Stein bei jeder Kamerabewegung.
  const body = ctx.createLinearGradient(0, surfaceY - height * 0.2, 0, surfaceY + height * 2.5);
  body.addColorStop(0, "#eaf9ff");
  body.addColorStop(0.1, "#b9dff1");
  body.addColorStop(0.3, "#5f9fc0");
  body.addColorStop(0.6, "#22597c");
  body.addColorStop(1, "#0a2437");
  ctx.fillStyle = body;
  ctx.fill(path);

  // Facettenkanten – als Clip auf den Körper, damit nichts überläuft.
  ctx.save();
  ctx.clip(path);
  ctx.strokeStyle = "rgba(226, 246, 255, 0.1)";
  ctx.lineWidth = 1.4;
  const cx = width * 0.62;
  for (let i = 0; i < 14; i++) {
    const y = (0.5 + i * 0.19) * height - cameraY;
    ctx.beginPath();
    ctx.moveTo(cx - width * 0.4, y);
    ctx.lineTo(cx + width * (0.1 + noise(i) * 0.35), y + height * 0.16);
    ctx.stroke();
  }
  ctx.restore();

  // Atmosphärische Tiefe: Je weiter unten am Eisberg, desto mehr Wasser liegt
  // zwischen Kamera und Fläche. Ohne diesen Abfall bleibt die Masse eine
  // gleichmässig helle Wand und der Text davor wird unlesbar.
  const attenuation = ctx.createLinearGradient(
    0,
    surfaceY,
    0,
    surfaceY + height * 2.6,
  );
  attenuation.addColorStop(0, "rgba(9, 52, 80, 0)");
  attenuation.addColorStop(0.28, "rgba(7, 40, 64, 0.55)");
  attenuation.addColorStop(0.6, "rgba(5, 24, 40, 0.85)");
  attenuation.addColorStop(1, "rgba(2, 10, 20, 0.96)");
  ctx.fillStyle = attenuation;
  ctx.fill(path);

  // Kaltes Streulicht an der Kante – bleibt auch in der Tiefe sichtbar und
  // hält die Silhouette lesbar.
  ctx.save();
  ctx.strokeStyle = "rgba(150, 216, 245, 0.28)";
  ctx.lineWidth = 1.6;
  ctx.shadowColor = "rgba(90, 190, 240, 0.5)";
  ctx.shadowBlur = 26;
  ctx.stroke(path);
  ctx.restore();
}

/** Tiefen-Dunst: legt sich zunehmend über die Szene. */
function paintDepthHaze(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
) {
  const haze = ctx.createLinearGradient(0, 0, 0, height);
  const alpha = 0.1 + progress * 0.34;
  haze.addColorStop(0, `rgba(3, 16, 29, ${alpha * 0.35})`);
  haze.addColorStop(1, `rgba(2, 6, 15, ${alpha})`);
  ctx.fillStyle = haze;
  ctx.fillRect(0, 0, width, height);

  // Vignette hält den Blick in der Bildmitte.
  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.25,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.78,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Zeichnet einen kompletten Frame.
 *
 * @param progress Scroll-Fortschritt der Seite, 0 (Oberfläche) bis 1 (Tiefe).
 */
export function paintIcebergFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
) {
  const cameraY = progress * (WORLD_HEIGHT - 1) * height;

  ctx.clearRect(0, 0, width, height);
  paintWater(ctx, width, height, cameraY);
  paintLightShafts(ctx, width, height, cameraY, progress);
  paintIcebergBody(ctx, width, height, cameraY);
  paintDepthHaze(ctx, width, height, progress);
}
