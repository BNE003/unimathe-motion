// Kamera und Bühnenzustand für „Banach-Tarski“. Canvas und Overlays lesen beide nur von hier.
// Welt: z nach oben, Kugeln mit Radius 1. Der Baum liegt in Bildschirmkoordinaten.
import {V2, clamp, easeInOutCubic, easeOutCubic, lerp, prog} from '../math';
import {V3, dot3} from '../space';
import {ANGLE, AXIS, Letter, branchOf, rotAxis, treePos} from './group';
import {T} from './timeline';

type Key = [number, number, number, ((x: number) => number)?];
export const chain = (t: number, v0: number, keys: Key[]) =>
  keys.reduce((v, [at, dur, to, ease = easeInOutCubic]) => lerp(v, to, ease(clamp((t - at) / dur))), v0);
const sine = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x);

/* ---------- Kamera ---------- */

export type Cam = {p: (q: V3) => V2; depth: (q: V3) => number; scale: (q: V3) => number; pos: V3; fw: V3; r: V3; up: V3};

export const makeCam = (theta: number, phi: number, tg: V3, D: number, u: number, cx: number, cy: number): Cam => {
  const th = (theta * Math.PI) / 180;
  const ph = (phi * Math.PI) / 180;
  const r: V3 = [-Math.sin(ph), Math.cos(ph), 0];
  const up: V3 = [-Math.sin(th) * Math.cos(ph), -Math.sin(th) * Math.sin(ph), Math.cos(th)];
  const fw: V3 = [Math.cos(th) * Math.cos(ph), Math.cos(th) * Math.sin(ph), Math.sin(th)];
  const pos: V3 = [tg[0] + fw[0] * D, tg[1] + fw[1] * D, tg[2] + fw[2] * D];
  const rel = (q: V3): V3 => [q[0] - tg[0], q[1] - tg[1], q[2] - tg[2]];
  const depth = (q: V3) => D - dot3(rel(q), fw);
  return {
    p: (q) => {
      const d = rel(q);
      const f = (u * D) / Math.max(0.05, D - dot3(d, fw));
      return [cx + f * dot3(d, r), cy - f * dot3(d, up)];
    },
    depth,
    scale: (q) => (u * D) / Math.max(0.05, depth(q)),
    pos,
    fw,
    r,
    up,
  };
};

export const camAt = (t: number) => {
  const th = chain(t, 10, [
    [0, 4, 16, sine],
    [T.kugel - 0.6, 1.2, 22],
    [T.staub, 1.2, 14],
    [T.haken, 1.2, 10],
  ]);
  const ph = chain(t, 264, [
    [0, T.wie + 0.6, 276, sine],
    [T.kugel - 0.6, 1.2, 252],
    [T.kugel + 0.6, T.axiom - T.kugel, 236, sine],
    [T.staub, T.zweiK + 1 - T.staub, 262, sine],
    [T.haken, T.cta - T.haken, 236, sine],
  ]);
  const D = 9;
  const u = chain(t, 270, [
    [T.aber, 1.8, 190],
    [T.kugel - 0.6, 1.2, 285],
    [T.drehen, 1.2, 190],
    [T.volumen - 0.3, 1.6, 360],
    [T.gold - 0.2, 0.9, 260],
  ]);
  const tx = chain(t, 0, [[T.volumen - 0.3, 1.6, -1.25], [T.gold - 0.2, 0.9, 0]]);
  const cy = chain(t, 930, [[T.kugel - 0.6, 1.2, 1065], [T.staub - 0.3, 1.0, 930]]);
  return {cam: makeCam(th, ph, [tx, 0, 0], D, u, 540, cy), u};
};
export const project = (t: number, q: V3): V2 => camAt(t).cam.p(q);

/* ---------- Staub: 2.400 Punkte in der Kugel, jeder in einer von fünf Farben ---------- */

export type Cls = 0 | 1 | 2 | 3 | 4; // a, a⁻¹, b, b⁻¹, Rest
export const CLS_LETTER: (Letter | '')[] = ['a', 'A', 'b', 'B', ''];
let seed = 7;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
export const DUST: {h: V3; k: Cls; ph: number}[] = Array.from({length: 2400}, () => {
  const r = Math.cbrt(rnd());
  const z = rnd() * 2 - 1;
  const w = rnd() * Math.PI * 2;
  const q = Math.sqrt(1 - z * z);
  const x = rnd();
  const k = (x < 0.02 ? 4 : Math.min(3, Math.floor(((x - 0.02) / 0.98) * 4))) as Cls;
  return {h: [r * q * Math.cos(w), r * q * Math.sin(w), r * z] as V3, k, ph: rnd()};
});

export const LEFT: V3 = [-1.25, 0, 0];
export const RIGHT: V3 = [1.25, 0, 0];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mix = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];
const rotZ = (v: V3, w: number): V3 => [v[0] * Math.cos(w) - v[1] * Math.sin(w), v[0] * Math.sin(w) + v[1] * Math.cos(w), v[2]];

// Hook: Zerfall, Wirbel, Teilung auf zwei Kugeln
const hookPos = (d: (typeof DUST)[number], t: number): V3 => {
  const e = prog(t, T.zerlege, 1.3, easeOutCubic);
  const lenH = Math.hypot(...d.h);
  const swirl = rotZ([d.h[0] * (1 + 0.75 * e), d.h[1] * (1 + 0.75 * e), d.h[2] * (1 + 0.55 * e)], e * (1.4 + 0.9 * lenH) + 0.4 * Math.sin(d.ph * 9) * e);
  const s = prog(t, T.aber, T.zweiKugeln - T.aber + 0.1);
  const target = add(d.k <= 1 ? LEFT : RIGHT, d.h);
  return mix(swirl, target, s);
};

// Auflösung: aus der Kugel werden fünf Staubteile; a⁻¹ dreht um a, b⁻¹ um b, dann zwei Kugeln
const buildPos = (d: (typeof DUST)[number], t: number): V3 => {
  const m = prog(t, T.drehen - 0.05, T.zweiK - T.drehen + 0.1);
  const r = prog(t, T.drehen + 0.1, T.zweiK - T.drehen - 0.1);
  let q = d.h;
  if (d.k === 1) q = rotAxis(AXIS.a, ANGLE * r, q);
  if (d.k === 3) q = rotAxis(AXIS.b, ANGLE * r, q);
  const c: V3 = d.k <= 1 ? LEFT : d.k <= 3 ? RIGHT : [0, 0, 0];
  return add(mix([0, 0, 0], c, m), q);
};

export const dustPos = (d: (typeof DUST)[number], t: number): V3 => (t < T.staub - 0.5 ? hookPos(d, t) : buildPos(d, t));

// Sichtbarkeit je Punkt
export const dustAlpha = (d: (typeof DUST)[number], t: number): number => {
  if (t < T.staub - 0.5) return prog(t, T.zerlege - 0.05, 0.25) * (1 - prog(t, T.zweiKugeln + 0.1, 0.6));
  let a = prog(t, T.staub - 0.1, 0.6) * (1 - prog(t, T.zweiK, 0.5));
  if (d.k === 4) a *= 1 - prog(t, T.drehen, 0.6);
  // „Volumen = ?“: nur ein Teil (a⁻¹) bleibt als Staub
  if (t >= T.haken) a = (d.k === 1 ? prog(t, T.haken + 0.1, 0.5) : 0) * (1 - prog(t, T.gold - 0.2, 0.5));
  return a;
};
export const dustInVolume = (t: number) => t >= T.haken;
// im Volumen-Teil: der a⁻¹-Staub liegt in der linken Kugel an seiner Endlage
export const volumePos = (d: (typeof DUST)[number]): V3 => add(LEFT, rotAxis(AXIS.a, ANGLE, d.h));

/* ---------- feste Kugeln ---------- */

export const oneBall = (t: number) => 1 - prog(t, T.zerlege, 0.35);
export const twoBallsHook = (t: number) => prog(t, T.zweiKugeln - 0.15, 0.6) * (1 - prog(t, T.wie + 0.05, 0.6));
export const sphereGlass = (t: number) => prog(t, T.kugel - 0.5, 0.6) * (1 - prog(t, T.staub - 0.2, 0.6));
export const twoBallsBuild = (t: number) => prog(t, T.zweiK - 0.2, 0.6) * (1 - prog(t, T.haken, 0.6));
export const goldBall = (t: number) => prog(t, T.gold - 0.1, 0.6) * (1 - prog(t, T.cta - 0.2, 0.5));
export const radiusMarks = (t: number) => prog(t, T.ohneHinzu, 0.4) * (1 - prog(t, T.wie, 0.4));
export const floorVis = (t: number) => (1 - prog(t, T.wie, 0.5)) * 1 + prog(t, T.staub, 0.8) * (1 - prog(t, T.cta - 0.2, 0.5));
export const stageVis = (t: number) => chain(t, 1, [[T.cta - 0.1, 0.8, 0.09]]);

/* ---------- Baum (Bildschirm) ---------- */

export const TREE_C: V2 = [540, 930];
export const TREE_L = 205;
export const treeVis = (t: number) => prog(t, T.punkt - 0.2, 0.4) * (1 - prog(t, T.kugel - 0.3, 0.5));

// Wann wächst die Kante zum Wort w? Erst die vier Schritte einzeln, dann am rechten Ende die drei neuen, dann der Rest
const LEVEL1: Record<Letter, number> = {a: 0, A: 0, b: 0, B: 0};
export const growOf = (w: string, t: number): number => {
  const k = w.length;
  if (k === 0) return prog(t, T.punkt, 0.3);
  if (k === 1) {
    const at = {a: T.rechts - 0.15, A: T.links - 0.1, b: T.oben - 0.05, B: T.unten - 0.05}[w as Letter] + LEVEL1[w as Letter];
    return prog(t, at, 0.45, easeOutCubic);
  }
  if (k === 2) {
    if (w[0] === 'a') return prog(t, T.drei + 0.15, 0.7, easeOutCubic);
    const idx = {A: 0, b: 1, B: 2, a: 0}[w[0] as Letter];
    return prog(t, T.halb + 0.15 + idx * 0.15, 0.5, easeOutCubic);
  }
  return prog(t, T.baum - 0.15 + (k - 3) * 0.2, 0.35, easeOutCubic);
};
// Pfeilspitzen an den ersten vier Schritten, bis die nächsten wachsen
export const arrowVis = (t: number) => 1 - prog(t, T.drei, 0.4);
// „nie zurück“: durchgestrichener Rückweg am rechten Ende
export const backVis = (t: number) => prog(t, T.zurueck - 0.1, 0.3) * (1 - prog(t, T.baum, 0.4));
// Längen 1 und ½
export const lenLabels = (t: number) => prog(t, T.halb, 0.3) * (1 - prog(t, T.baum + 0.4, 0.4));

export const treeSep = (t: number) => 0.07 * prog(t, T.geh, 0.5) * (1 - prog(t, T.zusammen, 0.6));
export const shiftA = (t: number) => prog(t, T.schritt + 0.05, T.ganzer - T.schritt + 0.05);
export const shiftB = (t: number) => prog(t, T.oben2 + 0.1, T.genauso + 0.55 - T.oben2);
export const treeSplit = (t: number) => prog(t, T.zusammen, 1.0);
// oben/unten verschwinden, solange der linke Ast allein den Rest füllt
export const otherBranches = (t: number) => 1 - prog(t, T.schritt - 0.3, 0.4) * (1 - prog(t, T.zusammen + 0.1, 0.5));

const BR_DIR: Record<Letter, [number, number]> = {a: [1, 0], A: [-1, 0], b: [0, 1], B: [0, -1]};

// Baumpunkt (Baumkoordinaten, y nach oben) → Bildschirm, mit Weiterrücken und Aufteilung auf zwei Bäume
export const treeScreen = (p: [number, number], br: Letter | '', t: number): V2 => {
  let [x, y] = p;
  const sep = treeSep(t);
  if (br) {
    x += BR_DIR[br][0] * sep;
    y += BR_DIR[br][1] * sep;
  }
  // Weiterrücken: Streckung ×2 um (−2, 0) bzw. (0, −2); auf der Kugel ist das eine Drehung
  if (br === 'A') {
    const s = shiftA(t);
    x += s * (x + 2);
    y += s * y;
  }
  if (br === 'B') {
    const s = shiftB(t);
    x += s * x;
    y += s * (y + 2);
  }
  const m = treeSplit(t);
  const left = br === 'a' || br === 'A';
  const right = br === 'b' || br === 'B';
  const cxs = left ? lerp(TREE_C[0], 296, m) : right ? lerp(TREE_C[0], 784, m) : TREE_C[0];
  const k = left || right ? lerp(1, 0.5, m) : 1;
  return [cxs + x * TREE_L * k, TREE_C[1] - y * TREE_L * k];
};
export const treeWordScreen = (w: string, t: number) => treeScreen(treePos(w), branchOf(w), t);

/* ---------- Brücke: kleiner Baum neben der Kugel ---------- */

export const INSET_C: V2 = [792, 636];
export const INSET_L = 64;
export const insetVis = (t: number) => prog(t, T.kugel + 0.1, 0.5) * (1 - prog(t, T.jederPunkt + 0.6, 0.5));
// Weiterrücken im kleinen Baum läuft gleichzeitig mit der Drehung der Kugel
export const insetShift = (t: number) => orbitRot(t);
export const insetScreen = (w: string, t: number): V2 => {
  let [x, y] = treePos(w);
  if (w[0] === 'A') {
    const s = insetShift(t);
    x += s * (x + 2);
    y += s * y;
  }
  return [INSET_C[0] + x * INSET_L, INSET_C[1] - y * INSET_L];
};

/* ---------- Bahn auf der Kugel ---------- */

// Vorführung der vier Drehungen am Startpunkt
export const demo = (t: number) => ({
  a: prog(t, T.achse1 + 0.15, 0.8),
  A: prog(t, T.achse1 + 0.8, 0.8),
  b: prog(t, T.achse2 + 0.15, 0.8),
  B: prog(t, T.achse2b, 0.8),
});
export const axisVis = (t: number) => ({
  a: prog(t, T.achse1, 0.3) * (1 - 0.6 * prog(t, T.weg, 0.5)) * (1 - prog(t, T.jederPunkt, 0.5)),
  b: prog(t, T.achse2, 0.3) * (1 - 0.6 * prog(t, T.weg, 0.5)) * (1 - prog(t, T.jederPunkt, 0.5)),
});
export const startVis = (t: number) => prog(t, T.statt, 0.4);
// Ebenen 2 und 3 wachsen bei „Jeder Weg führt …“
export const orbitGrow = (t: number) => 1 + chain(t, 0, [[T.weg + 0.1, 1.8, 2, (x) => x]]);
export const orbitRot = (t: number) => prog(t, T.verschieben + 0.3, T.drehung + 0.5 - T.verschieben - 0.3);
export const orbitLock = () => T.drehung + 0.5;
export const orbitMain = (t: number) => prog(t, T.statt - 0.2, 0.4) * (1 - 0.55 * prog(t, T.jederPunkt, 0.6)) * (1 - prog(t, T.staub - 0.1, 0.5));
export const orbitOthers = (t: number) => prog(t, T.jederPunkt, 0.9) * (1 - prog(t, T.staub - 0.1, 0.5));
export const choicePulse = (t: number) => prog(t, T.waehlt + 0.3, 0.5) * (1 - prog(t, T.staub - 0.1, 0.5));
// weitere Startpunkte (je eine eigene Bahn)
export const OTHER_STARTS: V3[] = [
  [0.85, 0.3, -0.43],
  [-0.6, -0.7, 0.38],
  [0.1, -0.95, -0.3],
  [-0.4, 0.55, 0.73],
  [-0.9, 0.1, -0.42],
  [0.55, -0.2, 0.81],
].map((v) => {
  const l = Math.hypot(...v);
  return [v[0] / l, v[1] / l, v[2] / l] as V3;
});
export {prog};
