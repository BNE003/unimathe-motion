// Geometrie, Zustände und Kamera für „Wie kann eine Fläche negativ sein?“. Canvas und Overlays lesen beide nur von hier.
// Die Mathe-Ebene liegt auf dem Glasboden: Punkt (x, y) liegt bei Welt (x, y, 0). Die Kamera schaut immer von oben (θ > 0),
// so erscheint jede Drehrichtung im Bild so, wie sie in der Ebene ist: gegen den Uhrzeigersinn bleibt gegen den Uhrzeigersinn.
import {V2, bump, clamp, easeInOutCubic, easeOutCubic, lerp} from '../math';
import {V3, makeCam} from '../space';
import {T} from './timeline';

type Key = [number, number, number, ((x: number) => number)?];
// ab Zeit `at` in `dur` Sekunden weich auf den Wert `to`
export const chain = (t: number, v0: number, keys: Key[]) =>
  keys.reduce((v, [at, dur, to, ease = easeInOutCubic]) => lerp(v, to, ease(clamp((t - at) / dur))), v0);

const sine = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x);
const eio = easeInOutCubic;

/* ---------- Mathematik ---------- */

// a = (3, 0), b = (0, 2): det(a, b) = 3·2 − 0·0 = 6
export const A: V2 = [3, 0];
export const B: V2 = [0, 2];
export const det = (a: V2, b: V2) => a[0] * b[1] - a[1] * b[0];
// Spiegelung an einer senkrechten Achse: (x, y) → (−x, y). a′ = (−3, 0), b′ = (0, 2), det(a′, b′) = −6
export const mirrorV = (v: V2): V2 => [-v[0], v[1]];

// Die Spiegelachse ist x = 0. Links liegt das Original, rechts sein Spiegelbild.
export const GAP = 1.0;
export const O1: V2 = [-(GAP / 2 + A[0]), 0];
export const O2: V2 = mirrorV(O1);

/* ---------- Die Spiegelung als Umklappen ---------- */

// Das Spiegelbild entsteht, indem eine Kopie der linken Fläche um die Spiegelachse (x = 0) umgeklappt wird.
// Bei φ = π liegt jeder Punkt (x, y) genau bei (−x, y): das ist die Spiegelung. Unterwegs bleibt die Kopie starr,
// ihre Fläche ändert sich also nie.
export const FLIP_AT = T.spiegeln - 0.1;
export const FLIP_D = 1.7;
export const flipPhi = (t: number) => {
  if (t < T.grund + 1) return Math.PI; // im Hook liegt das Spiegelbild schon rechts
  return Math.PI * eio(clamp((t - FLIP_AT) / FLIP_D));
};
export const flipMap = (phi: number) => (p: V2): V3 => [p[0] * Math.cos(phi), p[1], -p[0] * Math.sin(phi)];
export const flat = (p: V2): V3 => [p[0], p[1], 0];

/* ---------- Drehung vom ersten zum zweiten Vektor ---------- */

// Ein Zeiger startet als a und dreht sich (auf dem kürzeren Weg, 90°) bis er b ist. Er hinterlässt die Pfeilspur.
// Für das Spiegelbild wird derselbe Zeiger umgeklappt: dann dreht er von a′ nach b′, also im Uhrzeigersinn.
export const ARC_R = 1.05;
export const handAt = (s: number): V2 => {
  const w = (s * Math.PI) / 2;
  const L = lerp(3, 2, s);
  return [L * Math.cos(w), L * Math.sin(w)];
};

// Aufbau der Pfeilspur: [Beginn, Dauer]
export const SWEEP_L: [number, number] = [T.drehen - 0.15, 1.35];
export const SWEEP_R: [number, number] = [T.ersten2 + 0.35, 1.6];
export const sweep = (t: number, [at, d]: [number, number]) => eio(clamp((t - at) / d));

// Lichtimpulse, die die Spur entlanglaufen und die Richtung immer wieder zeigen
const every = (from: number, to: number, step: number) => Array.from({length: Math.max(0, Math.floor((to - from) / step))}, (_, i) => from + i * step);
export const FLOW_L = [T.hier + 0.25, T.gegen + 0.5, ...every(T.jetzt + 0.2, T.cta - 1, 2.2)];
export const FLOW_R = [T.andersherum + 0.1, T.imUhr + 0.1, T.umgekehrt, ...every(T.undGenau + 0.3, T.cta - 1, 2.2).filter((p) => Math.abs(p - T.umgekehrt) > 1.1)];
export const FLOW_D = 1.1;

/* ---------- Kästchen zählen ---------- */

// 3 · 2 Einheitsquadrate, Reihenfolge ab dem Ursprung
export const TILES: V2[] = [0, 1].flatMap((j) => [0, 1, 2].map((i) => [i, j] as V2));
export const TILE_P = [0.3, T.groesse2 + 0.1, T.gleicheF + 0.15];
export const tileLight = (t: number, k: number) => Math.max(...TILE_P.map((p) => bump(t, p + k * 0.15, 0.9)));

/* ---------- x-Komponente: a wird an der y-Achse gespiegelt ---------- */

// Im Koordinatensystem der rechten Fläche (Ursprung O2, x nach rechts, y entlang b′) startet eine Kopie von a bei x = +3
// und klappt um die y-Achse. Sie bleibt starr (Länge 3); ihr Schatten auf der x-Achse, die x-Komponente, wandert von +3 nach −3.
export const COMP_FLIP_D = 2.0;
export const compPhi = (t: number) => Math.PI * eio(clamp((t - T.flip) / COMP_FLIP_D));
export const ghostTip = (t: number): V3 => {
  const p = compPhi(t);
  return [O2[0] + 3 * Math.cos(p), 0, 3 * Math.sin(p)];
};
export const ghostX = (t: number) => 3 * Math.cos(compPhi(t));
export const LANDED2 = T.flip + COMP_FLIP_D;

/* ---------- Sichtbarkeit ---------- */

export const vis = {
  // rechte Fläche (das Spiegelbild): im Hook da, dann weg, als umgeklappte Kopie zurück
  right: (t: number) => (t < FLIP_AT - 0.05 ? chain(t, 1, [[T.grund, 0.8, 0]]) : 1),
  // linke Fläche: wird schwach, bevor die Vektoren sie neu aufspannen
  faceL: (t: number) => chain(t, 1, [[T.sondern, 0.5, 0.2], [T.aufspannen, 0.2, 1]]),
  span: (t: number) => (t < T.sondern ? 1 : eio(clamp((t - T.aufspannen - 0.05) / 1.1))),
  vecA: (t: number) => (t < T.grund ? 0 : easeOutCubic(clamp((t - T.vektoren + 0.1) / 0.55))),
  vecB: (t: number) => (t < T.grund ? 0 : easeOutCubic(clamp((t - T.vektoren - 0.35) / 0.55))),
  mirrorAxis: (t: number) => chain(t, 0, [[T.doch + 0.3, 0.6, 1], [FLIP_AT + FLIP_D + 0.4, 0.8, 0.25], [T.undGenau, 0.8, 0]]),
  axisGrow: (t: number) => eio(clamp((t - T.doch - 0.3) / 0.8)),
  stage: (t: number) => chain(t, 1, [[T.cta - 0.1, 0.8, 0.1]]),
  // lokale x-Achse der rechten Fläche: deutlich während der Erklärung, danach dezent
  compAxis: (t: number) => chain(t, 0, [[T.comp - 0.6, 0.7, 1], [T.calc + 0.2, 1.0, 0.22], [T.gleicheF, 0.8, 0]]),
  // linke Fläche tritt zurück, solange die rechte im Fokus steht
  leftDim: (t: number) => chain(t, 1, [[T.comp - 0.7, 0.6, 0.15], [T.calc, 0.8, 1]]),
  ghost: (t: number) => chain(t, 0, [[T.comp - 0.2, 0.5, 1], [LANDED2 + 0.05, 0.35, 0]]),
  // a′ tritt zurück, solange die Kopie von a gezeigt wird
  aR: (t: number) => chain(t, 1, [[T.comp - 0.3, 0.5, 0.22], [LANDED2 - 0.1, 0.3, 1]]),
};

export const pulseA = (t: number) => bump(t, T.vektoren + 0.25, 0.9) + bump(t, T.ersten, 1.0) + bump(t, T.ersten2, 1.0) * 0.6;
export const pulseB = (t: number) => bump(t, T.vektoren + 0.7, 0.9) + bump(t, T.zweiten, 1.0) + bump(t, T.ersten2 + 0.6, 1.0) * 0.6;

/* ---------- Kamera ---------- */

const O = easeOutCubic;
export const camAt = (t: number) => {
  const toBoth = T.doch;
  const th = chain(t, 33, [
    [0, 6.2, 52, O],
    [T.grund, 2.4, 50],
    [T.achte, 1.8, 84],
    [toBoth, 1.6, 60],
    [T.jetzt, 1.5, 80],
    [T.undGenau, 3, 70],
    [T.comp - 0.8, 1.3, 64],
    [T.calc, 1.2, 80],
    [T.gleicheF, 2.6, 64],
  ]);
  const ph = chain(t, -108, [
    [0, 6.2, -87, O],
    [T.grund, 2.4, -100],
    [T.achte, 1.8, -90],
    [T.undGenau, 6, -84, sine],
    [T.comp - 0.8, 1.3, -92],
    [T.calc, 1.2, -90],
    [T.gleicheF, 2.6, -95],
  ]);
  const u = chain(t, 168, [
    [0, 6.2, 140, O],
    [T.grund, 2.4, 196],
    [T.achte, 1.8, 222],
    [toBoth, 1.6, 116],
    [T.undGenau, 3, 112],
    [T.comp - 0.8, 1.3, 114],
    [T.calc, 1.2, 112],
    [T.gleicheF, 2.6, 104],
  ]);
  const tx = chain(t, -0.7, [
    [0, 6.2, 0.15, O],
    [T.grund, 2.4, O1[0] + 1.55],
    [T.achte, 1.8, O1[0] + 1.35],
    [toBoth, 1.6, 0],
    [T.comp - 0.8, 1.3, O2[0]],
    [T.calc, 1.2, 0],
  ]);
  const ty = chain(t, 1.0, [[T.achte, 1.8, 0.95], [toBoth, 1.6, 1.0], [T.comp - 0.8, 1.3, 0.75], [T.calc, 1.2, 1.0]]);
  const cy = chain(t, 1070, [[T.grund, 2.4, 1040], [toBoth, 1.6, 1060], [T.undGenau, 3, 1130], [T.comp - 0.8, 1.3, 1100], [T.calc, 1.2, 1130], [T.gleicheF, 2.6, 1120]]);
  const base = makeCam(th, ph, 540, cy, u);
  const rel = (q: V3): V3 => [q[0] - tx, q[1] - ty, q[2]];
  const cam = {p: (q: V3) => base.p(rel(q)), depth: (q: V3) => base.depth(rel(q))};
  return {cam, th, ph, u};
};
export type DCam = ReturnType<typeof camAt>['cam'];

export const project = (t: number, q: V3): V2 => camAt(t).cam.p(q);
