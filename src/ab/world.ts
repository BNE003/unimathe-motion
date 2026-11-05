// Geometrie, Matrizen und Kameras für „Warum ist AB ≠ BA?“. Canvas und Overlays lesen beide nur von hier.
import {V2, clamp, easeInOutCubic, easeOutCubic, lerp, prog} from '../math';
import {V3, dot3, makeCam} from '../space';
import {T} from './timeline';

/* ---------- 3×3 und 2×2 ---------- */

export type M3 = [V3, V3, V3];
export type M2 = [[number, number], [number, number]];
export const I3: M3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
export const mul3 = (A: M3, B: M3): M3 =>
  A.map((r) => [0, 1, 2].map((j) => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j])) as M3;
export const ap3 = (M: M3, v: V3): V3 => [dot3(M[0], v), dot3(M[1], v), dot3(M[2], v)];
const rad = (d: number) => (d * Math.PI) / 180;
// Drehungen um feste Raumachsen, positiver Winkel gegen den Uhrzeigersinn (Rechtssystem)
export const Rx = (d: number): M3 => {
  const c = Math.cos(rad(d));
  const s = Math.sin(rad(d));
  return [[1, 0, 0], [0, c, -s], [0, s, c]];
};
export const Rz = (d: number): M3 => {
  const c = Math.cos(rad(d));
  const s = Math.sin(rad(d));
  return [[c, -s, 0], [s, c, 0], [0, 0, 1]];
};
export const mixM3 = (A: M3, B: M3, s: number): M3 => A.map((r, i) => r.map((a, j) => lerp(a, B[i][j], s))) as M3;

export const mul2 = (A: M2, B: M2): M2 => [
  [A[0][0] * B[0][0] + A[0][1] * B[1][0], A[0][0] * B[0][1] + A[0][1] * B[1][1]],
  [A[1][0] * B[0][0] + A[1][1] * B[1][0], A[1][0] * B[0][1] + A[1][1] * B[1][1]],
];
export const ap2 = (M: M2, p: V2): V2 => [M[0][0] * p[0] + M[0][1] * p[1], M[1][0] * p[0] + M[1][1] * p[1]];
// A dreht um 90° (Teilweg = Drehung um 90·p Grad), B streckt waagerecht ×2 (Teilweg = Faktor 1 + p)
export const matA = (p: number): M2 => {
  const c = Math.cos(rad(90 * p));
  const s = Math.sin(rad(90 * p));
  return [[c, -s], [s, c]];
};
export const matB = (p: number): M2 => [[1 + p, 0], [0, 1]];

/* ---------- Das F: 3 breit, 5 hoch, Mitte im Ursprung ---------- */

export const CELLS: [number, number][] = [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [1, 4], [2, 4], [1, 2]];
export const SPINE = CELLS.filter(([i]) => i === 0);
export const ARMS = CELLS.filter(([i]) => i > 0);
const OX = 1.5;
const OY = 2.5;
export const cellQuad = ([i, j]: [number, number]): V2[] => [
  [i - OX, j - OY],
  [i + 1 - OX, j - OY],
  [i + 1 - OX, j + 1 - OY],
  [i - OX, j + 1 - OY],
];
const has = (cells: [number, number][], i: number, j: number) => cells.some(([a, b]) => a === i && b === j);
// Randkanten einer Zellmenge (Kanten ohne Nachbarzelle)
export const outline = (cells: [number, number][]): [V2, V2][] => {
  const out: [V2, V2][] = [];
  for (const [i, j] of cells) {
    const [a, b, c, d] = cellQuad([i, j]);
    if (!has(cells, i, j - 1)) out.push([a, b]);
    if (!has(cells, i + 1, j)) out.push([b, c]);
    if (!has(cells, i, j + 1)) out.push([c, d]);
    if (!has(cells, i - 1, j)) out.push([d, a]);
  }
  return out;
};
export const F_OUTLINE = outline(CELLS);
export const ARMS_OUTLINE = outline(ARMS);
export const SPINE_OUTLINE = outline(SPINE);

// 3D-F: dieselben Zellen in der xz-Ebene, 1 tief; Vorderseite zeigt nach −y (zur Kamera)
export type Face = {v: V3[]; n: V3; kind: 'front' | 'back' | 'side'};
export const F_FACES: Face[] = (() => {
  const faces: Face[] = [];
  for (const [i, j] of CELLS) {
    const x0 = i - OX;
    const x1 = x0 + 1;
    const z0 = j - OY;
    const z1 = z0 + 1;
    const y0 = -0.5;
    const y1 = 0.5;
    faces.push({v: [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], n: [0, -1, 0], kind: 'front'});
    faces.push({v: [[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]], n: [0, 1, 0], kind: 'back'});
    if (!has(CELLS, i - 1, j)) faces.push({v: [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], n: [-1, 0, 0], kind: 'side'});
    if (!has(CELLS, i + 1, j)) faces.push({v: [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], n: [1, 0, 0], kind: 'side'});
    if (!has(CELLS, i, j - 1)) faces.push({v: [[x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]], n: [0, 0, -1], kind: 'side'});
    if (!has(CELLS, i, j + 1)) faces.push({v: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], n: [0, 0, 1], kind: 'side'});
  }
  return faces;
})();

/* ---------- Hook: zwei Fs, gleiche Bewegungen, andere Reihenfolge ---------- */

export const F_POS: V3[] = [[-3.2, 0, 3], [3.2, 0, 3]];
export const MOVE = 0.9; // Dauer einer 90°-Bewegung

// F1: erst kippen (Rx), dann drehen (Rz) → Rz·Rx. F2: erst drehen, dann kippen → Rx·Rz.
export const fRot = (k: number, t: number): M3 => {
  if (k === 0) return mul3(Rz(90 * prog(t, T.dreh1, MOVE)), Rx(90 * prog(t, T.kipp1, MOVE)));
  return mul3(Rx(90 * prog(t, T.kipp2, MOVE)), Rz(90 * prog(t, T.dreh2, MOVE)));
};

// „Jede Matrix bewegt den ganzen Raum“: der ganze Raum schwingt einmal durch eine Scherdrehung und zurück
const SWING: M3 = mul3(Rz(26), [[1, 0, 0.42], [0, 1, 0], [0, 0, 1]]);
export const spaceMap = (t: number): M3 => {
  const s = prog(t, T.bewegt, 0.6) - prog(t, T.bewegt + 0.75, 0.55);
  return s === 0 ? I3 : mixM3(I3, SWING, s);
};

/* ---------- Kameras ---------- */

export type CamP = {th: number; ph: number; tg: V3; cy: number; u: number};
const mixCam = (a: CamP, b: CamP, s: number): CamP => ({
  th: lerp(a.th, b.th, s),
  ph: lerp(a.ph, b.ph, s),
  tg: [lerp(a.tg[0], b.tg[0], s), lerp(a.tg[1], b.tg[1], s), lerp(a.tg[2], b.tg[2], s)],
  cy: lerp(a.cy, b.cy, s),
  u: lerp(a.u, b.u, s),
});
// Kette von Übergängen: ab Zeit `at` in `dur` Sekunden auf den Wert
const kf = (t: number, v0: number, keys: [number, number, number][], ease = easeInOutCubic) =>
  keys.reduce((v, [at, dur, to]) => lerp(v, to, ease(clamp((t - at) / dur))), v0);

const hookCam = (t: number): CamP => {
  const swoop = easeOutCubic(clamp(t / 1.8));
  const th = kf(t, lerp(50, 31, swoop), [
    [T.anders - 0.15, 1.1, 26],
    [T.voellig - 0.25, 2.3, 37],
    [T.raum, 1.3, 27],
  ]) + 1.5 * Math.sin(t / 2.1);
  const ph = kf(t, lerp(-58, -70, swoop), [
    [T.anders - 0.15, 1.1, -78],
    [T.voellig - 0.25, 2.3, -50],
    [T.raum, 1.3, -60],
  ]) + 3 * Math.sin(t / 2.7);
  const fx = kf(t, F_POS[0][0], [[T.anders - 0.15, 1.1, 0]]);
  const u = kf(t, lerp(96, 112, swoop), [
    [T.anders - 0.15, 1.1, 80],
    [T.voellig - 0.25, 2.3, 84],
    [T.raum, 1.3, 62],
  ]);
  return {th, ph, tg: [fx, 0, 2.7], cy: 880, u};
};

// Ebenen-Kamera der Platte i (0 = oben bzw. die einzige, 1 = unten)
export const sheetCam = (i: number, t: number): CamP => {
  const sp = prog(t, T.split, 0.95);
  const pf = prog(t, T.pfeile - 0.2, 0.9);
  const drift = 1 - 0.7 * pf;
  const th = lerp(74, 86, pf) + 2.5 * drift * Math.sin(t / 2.9);
  const ph = -90 + 7 * drift * Math.sin(t / 3.7);
  const cy0 = i === 0 ? 600 : 1150;
  const cy1 = i === 0 ? 580 : 1040;
  const cy = lerp(lerp(880, cy0, sp), cy1, pf);
  const u = lerp(lerp(92, 80, sp), 64, pf);
  return {th, ph, tg: [0, 0, 0], cy, u};
};

const backCam = (t: number): CamP => ({
  th: 29 + 1.5 * Math.sin(t / 2.3),
  ph: lerp(-50, -26, prog(t, T.bewegungen, 4.5, (x) => x)),
  tg: [0, 0, 2.7],
  cy: 780,
  u: 66,
});

export const diveP = (t: number) => prog(t, T.dive, 1.25);
export const backP = (t: number) => prog(t, T.bewegungen - 0.1, 1.3);

// Kamera der 3D-Welt: Hook → Sturzflug auf die Ebene → zurück in den Raum
export const worldCam = (t: number): CamP => {
  if (t < T.split) return mixCam(hookCam(t), sheetCam(0, t), diveP(t));
  return mixCam(sheetCam(0, t), backCam(t), backP(t));
};

export const camOf = (c: CamP) => {
  const m = makeCam(c.th, c.ph, 540, c.cy, c.u);
  const th = rad(c.th);
  const ph = rad(c.ph);
  const fw: V3 = [Math.cos(th) * Math.cos(ph), Math.cos(th) * Math.sin(ph), Math.sin(th)];
  const rel = (q: V3): V3 => [q[0] - c.tg[0], q[1] - c.tg[1], q[2] - c.tg[2]];
  return {
    p: (q: V3) => m.p(rel(q)),
    depth: (q: V3) => m.depth(rel(q)),
    eye: [c.tg[0] + 16 * fw[0], c.tg[1] + 16 * fw[1], c.tg[2] + 16 * fw[2]] as V3,
  };
};
export type Cam = ReturnType<typeof camOf>;

/* ---------- Platten: welche Matrix gerade wirkt ---------- */

// Platte 0 allein (S3): A und B je einmal vorführen und zurückspulen. Danach oben A·B, unten B·A.
export const sheetM = (i: number, t: number): M2 => {
  if (t < T.split) {
    const a = prog(t, T.aDreht + 0.15, 0.9) - prog(t, T.aDreht + 1.55, 0.4);
    const b = prog(t, T.bZieht + 0.25, 0.9) - prog(t, T.split - 0.4, 0.35);
    return mul2(matA(a), matB(b));
  }
  // Aha: beide spulen zurück bis vor B, dann zieht B auf beiden Platten gleichzeitig
  const rew = prog(t, T.zieht, 0.5);
  const bAha = prog(t, T.zieht + 0.7, 1.1);
  if (i === 0) {
    const b = Math.max(prog(t, T.breit, 0.9) * (1 - rew), bAha);
    const a = Math.max(prog(t, T.gedreht, 0.85) * (1 - rew), prog(t, T.wieder, 0.9));
    return mul2(matA(a), matB(b));
  }
  const a = prog(t, T.erstA + 0.08, 0.85);
  const b = Math.max(prog(t, T.lang - 0.45, 1.0) * (1 - rew), bAha);
  return mul2(matB(b), matA(a));
};

// Endergebnisse für die Matrizen (aus den Matrizen selbst, nicht abgeschrieben)
export const AB = mul2(matA(1), matB(1)).map((r) => r.map((x) => Math.round(x))) as M2;
export const BA = mul2(matB(1), matA(1)).map((r) => r.map((x) => Math.round(x))) as M2;

export const sheetAlpha = (i: number, t: number) => {
  if (i === 0) return prog(t, T.dive + 0.45, 0.6) * (1 - prog(t, T.bewegungen - 0.1, 0.7));
  return prog(t, T.split, 0.5) * (1 - prog(t, T.bewegungen - 0.1, 0.7));
};

// Maske (oberer und unterer Rand) der Platten in Bildschirm-y
export const sheetMask = (i: number, t: number): [number, number] => {
  const sp = prog(t, T.split, 0.95);
  const pf = prog(t, T.pfeile - 0.2, 0.9);
  const solo: [number, number] = [250, 1480];
  const duo: [number, number] = i === 0 ? [300, 890] : [905, 1420];
  const fin: [number, number] = i === 0 ? [300, 860] : [870, 1200];
  const m = (k: 0 | 1) => lerp(lerp(solo[k], duo[k], sp), fin[k], pf);
  return [m(0), m(1)];
};

// Screen-Position eines Ebenenpunkts auf Platte i
export const sheetPoint = (i: number, t: number, p: V2): V2 => {
  const cam = camOf(i === 0 && t < T.split ? worldCam(t) : sheetCam(i, t));
  return cam.p([p[0], p[1], 0]);
};
