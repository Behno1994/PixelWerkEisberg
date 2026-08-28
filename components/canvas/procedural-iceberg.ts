/**
 * Prozedurale Eisberg-Szene.
 *
 * Zeichnet die Kamerafahrt von der Wasseroberfläche in die Tiefsee direkt auf
 * ein 2D-Canvas – ohne Video, ohne Bildsequenz. Damit ist die Scrollytelling-
 * Mechanik vollständig testbar, bevor das eigentliche Videomaterial vorliegt;
 * die Signatur entspricht der eines Frame-Renderers und lässt sich später 1:1
 * durch `drawImage` ersetzen.
 *
 * Wichtig für die Textstufen darüber: Die Szene beginnt **high-key** (heller
 * arktischer Himmel, brillantes Eis) und wird zur Tiefe hin dunkel. Genau
 * diesem Verlauf folgen die Textfarben – Stufe 1 und 2 stehen dunkel auf
 * hellem Bild, Stufe 3 weiss auf dunklem. Der Umschlagpunkt liegt bei p ≈ 0.55.
 *
 * Weltkoordinaten sind Vielfache der Bildhöhe: Die Szene ist `WORLD_HEIGHT`
 * Bildhöhen tief, die Kamera fährt über den Fortschritt hindurch.
 */

/** Höhe der Szene in Bildhöhen. */
const WORLD_HEIGHT = 3.4;
/** Position der Wasseroberfläche in Weltkoordinaten. */
const WATER_LINE = 0.58;

/** Deterministischer Pseudo-Zufall – gleiche Silhouette in jedem Frame. */
function noise(seed: number) {
  const x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

/** Weiche Interpolation zwischen zwei Schwellen (0 unterhalb, 1 oberhalb). */
function smoothstep(edge0: number, edge1: number, value: number) {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Mischt zwei `#rrggbb`-Farben. `t = 0` liefert `a`, `t = 1` liefert `b`. */
function mix(a: string, b: string, t: number) {
  const pa = Number.parseInt(a.slice(1), 16);
  const pb = Number.parseInt(b.slice(1), 16);
  const r = Math.round((((pa >> 16) & 255) * (1 - t)) + (((pb >> 16) & 255) * t));
  const g = Math.round((((pa >> 8) & 255) * (1 - t)) + (((pb >> 8) & 255) * t));
  const bl = Math.round(((pa & 255) * (1 - t)) + ((pb & 255) * t));
  return `rgb(${r}, ${g}, ${bl})`;
}

/**
 * Lichtniveau der Szene: 1 an der Oberfläche, 0 in der Tiefe.
 *
 * Der Abfall ist exakt auf die Textstufen abgestimmt: Stufe 1 und 2 stehen
 * dunkel auf hellem Bild und laufen bis p = 0.55 – bis dahin bleibt das Bild
 * high-key. Abgedunkelt wird in der textfreien Lücke zwischen 0.55 und 0.67,
 * sodass Stufe 3 (weisse Schrift) ab ihrem Einblenden auf dunklem Grund steht.
 */
function lightLevel(progress: number) {
  return 1 - smoothstep(0.5, 0.78, progress);
}

/**
 * Silhouette des Eisbergs.
 *
 * Rechts der Mitte platziert: Die linke Bildhälfte bleibt frei und trägt die
 * Textstufen, ohne dass ein Abdunkler nötig wäre.
 */
function icebergPath(width: number, height: number, cameraY: number): Path2D {
  const path = new Path2D();
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

/** Himmel und Wasserkörper, aufgehellt nach Lichtniveau. */
function paintWater(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  cameraY: number,
  light: number,
) {
  const surfaceY = WATER_LINE * height - cameraY;

  // Himmel über der Oberfläche: heller arktischer Dunst.
  if (surfaceY > 0) {
    const sky = ctx.createLinearGradient(0, Math.min(0, surfaceY - height), 0, surfaceY);
    sky.addColorStop(0, mix("#0a1424", "#c3ddec", light));
    sky.addColorStop(0.55, mix("#122a40", "#dcedf6", light));
    sky.addColorStop(1, mix("#1c4260", "#f2fafd", light));
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, Math.max(0, surfaceY));
  }

  // Wasserkörper: je tiefer, desto dunkler und gesättigter.
  const top = Math.max(0, surfaceY);
  const water = ctx.createLinearGradient(0, top, 0, height);
  water.addColorStop(0, mix("#0c3b5a", "#a8e4f4", light));
  water.addColorStop(0.16, mix("#0a2b45", "#7fcfe8", light));
  water.addColorStop(0.48, mix("#061a2b", "#4aa8cd", light));
  water.addColorStop(1, mix("#01060e", "#2b7fa6", light));
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
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 + light * 0.45})`;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Heller Schaumsaum direkt unter der Kante.
    ctx.lineWidth = 14;
    ctx.strokeStyle = `rgba(220, 245, 255, ${0.08 + light * 0.14})`;
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
  light: number,
) {
  const surfaceY = WATER_LINE * height - cameraY;
  if (light <= 0.02) return;

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  for (let i = 0; i < 7; i++) {
    const x = width * (0.08 + i * 0.14 + noise(i) * 0.05);
    const spread = width * (0.03 + noise(i + 20) * 0.05);
    const shaft = ctx.createLinearGradient(x, surfaceY, x + spread * 2, height);
    shaft.addColorStop(0, `rgba(235, 250, 255, ${0.1 * light})`);
    shaft.addColorStop(1, "rgba(210, 244, 255, 0)");

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
  light: number,
) {
  const surfaceY = WATER_LINE * height - cameraY;
  const path = icebergPath(width, height, cameraY);

  // Grundkörper. Der Verlauf ist in Weltkoordinaten verankert (nicht am
  // Bildschirm), damit dieselbe Stelle des Eisbergs ihre Farbe behält – sonst
  // „atmet" der Berg bei jeder Kamerabewegung.
  const body = ctx.createLinearGradient(0, surfaceY - height * 0.2, 0, surfaceY + height * 2.5);
  body.addColorStop(0, mix("#93a8bb", "#ffffff", light));
  body.addColorStop(0.1, mix("#6f8ba3", "#e2f4fd", light));
  body.addColorStop(0.3, mix("#3d6480", "#9fd6ec", light));
  body.addColorStop(0.6, mix("#1b4159", "#4e9dc0", light));
  body.addColorStop(1, mix("#08192a", "#1a5c80", light));
  ctx.fillStyle = body;
  ctx.fill(path);

  // Facettenkanten – als Clip auf den Körper, damit nichts überläuft.
  ctx.save();
  ctx.clip(path);
  ctx.strokeStyle = `rgba(255, 255, 255, ${0.08 + light * 0.14})`;
  ctx.lineWidth = 1.6;
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
  // gleichmässig helle Wand.
  const attenuation = ctx.createLinearGradient(0, surfaceY, 0, surfaceY + height * 2.6);
  const deep = 1 - light;
  attenuation.addColorStop(0, "rgba(9, 52, 80, 0)");
  attenuation.addColorStop(0.28, `rgba(7, 40, 64, ${0.1 + deep * 0.48})`);
  attenuation.addColorStop(0.6, `rgba(5, 24, 40, ${0.22 + deep * 0.63})`);
  attenuation.addColorStop(1, `rgba(2, 10, 20, ${0.38 + deep * 0.58})`);
  ctx.fillStyle = attenuation;
  ctx.fill(path);

  // Kaltes Streulicht an der Kante – hält die Silhouette auch in der Tiefe lesbar.
  ctx.save();
  ctx.strokeStyle = `rgba(150, 216, 245, ${0.2 + light * 0.3})`;
  ctx.lineWidth = 1.8;
  ctx.shadowColor = "rgba(90, 190, 240, 0.5)";
  ctx.shadowBlur = 26;
  ctx.stroke(path);
  ctx.restore();
}

/** Tiefen-Dunst und Vignette – legen sich zunehmend über die Szene. */
function paintDepthHaze(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  light: number,
) {
  const deep = 1 - light;

  if (deep > 0.01) {
    const haze = ctx.createLinearGradient(0, 0, 0, height);
    haze.addColorStop(0, `rgba(3, 12, 24, ${deep * 0.24})`);
    haze.addColorStop(1, `rgba(2, 6, 15, ${deep * 0.62})`);
    ctx.fillStyle = haze;
    ctx.fillRect(0, 0, width, height);
  }

  // Vignette hält den Blick in der Bildmitte; über Wasser dezenter.
  const vignette = ctx.createRadialGradient(
    width / 2,
    height / 2,
    Math.min(width, height) * 0.25,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.78,
  );
  vignette.addColorStop(0, "rgba(0,0,0,0)");
  vignette.addColorStop(1, `rgba(0,0,0,${0.08 + deep * 0.46})`);
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Zeichnet einen kompletten Frame.
 *
 * @param progress Fortschritt der Szene, 0 (Oberfläche, hell) bis 1 (Tiefe, dunkel).
 */
export function paintIcebergFrame(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  progress: number,
) {
  const cameraY = progress * (WORLD_HEIGHT - 1) * height;
  const light = lightLevel(progress);

  ctx.clearRect(0, 0, width, height);
  paintWater(ctx, width, height, cameraY, light);
  paintLightShafts(ctx, width, height, cameraY, light);
  paintIcebergBody(ctx, width, height, cameraY, light);
  paintDepthHaze(ctx, width, height, light);
}
