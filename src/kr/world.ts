// Geometrie, Zustände und Kamera für „Rang und Invertierbarkeit“. Canvas und Overlays lesen beide nur von hier.
// Mathe-Koordinaten (x, y, z) sind direkt Weltkoordinaten, z zeigt nach oben.
// Die Zeilen von A(a) = (1 2 1; 2 5 3; 1 3 a) sind Pfeile. Z₁ und Z₂ spannen die Ebene x − y + z = 0 auf.
// Höhe über der Ebene, senkrecht nach oben (z) gemessen: h(v) = x − y + z. Gauß-Schritte addieren nur Vektoren der Ebene,
// h bleibt also gleich: h(Z₃) = 1 − 3 + a = a − 2 und h(0, 0, a − 2) = a − 2.
import {V2, clamp, easeInOutCubic, easeOutCubic, lerp} from '../math';
import {V3} from '../space';
import {T} from './timeline';

type Key = [number, number, number, ((x: number) => number)?];
// ab Zeit `at` in `dur` Sekunden weich auf den Wert `to`
export const chain = (t: number, v0: number, keys: Key[]) =>
  keys.reduce((v, [at, dur, to, ease = easeInOutCubic]) => lerp(v, to, ease(clamp((t - at) / dur))), v0);

const eio = easeInOutCubic;

/* ---------- Mathematik ---------- */

export const sub = (p: V3, q: V3, k = 1): V3 => [p[0] - k * q[0], p[1] - k * q[1], p[2] - k * q[2]];
export const addV = (p: V3, q: V3, k = 1): V3 => [p[0] + k * q[0], p[1] + k * q[1], p[2] + k * q[2]];
export const cross = (p: V3, q: V3): V3 => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]];
export const dot = (p: V3, q: V3) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
export const norm = (p: V3): V3 => {
  const l = Math.hypot(...p);
  return [p[0] / l, p[1] / l, p[2] / l];
};

export const Z1: V3 = [1, 2, 1];
export const Z2: V3 = [2, 5, 3];
export const Z3 = (a: number): V3 => [1, 3, a];
export const R2: V3 = sub(Z2, Z1, 2); // (0, 1, 1)
// Höhe über der Ebene x − y + z = 0, in z-Richtung gemessen
export const hOf = (v: V3) => v[0] - v[1] + v[2];
// Punkt der Ebene senkrecht unter (bzw. über) v
export const footOf = (v: V3): V3 => [v[0], v[1], v[2] - hOf(v)];
// A(a)·x
export const Ax = (a: number, x: V3): V3 => [dot(Z1, x), dot(Z2, x), dot(Z3(a), x)];

// Ebene: Normale n, zwei Richtungen in der Ebene (orthonormal)
export const N = norm([1, -1, 1]);
export const E1 = norm([1, 1, 0]);
export const E2 = norm([-1, 1, 2]);

/* ---------- Zustände im Raum ---------- */

// Beispielwert im Raum: a = 5. Später läuft a auf 2.
export const A_EX = 5;
export const SLIDE: [number, number] = [T.beiA2b + 0.2, T.keine - 0.3 - (T.beiA2b + 0.2)];
export const aAt = (t: number) => chain(t, A_EX, [[SLIDE[0], SLIDE[1], 2, (x) => x]]);

// Gauß-Schritte im Raum: Z₂ − 2Z₁, dann Z₃ − Z₁, dann Z₃ − Z₂′
export const STEP_A: [number, number] = [T.gaussSchritt + 0.5, T.deshalb - 0.4 - (T.gaussSchritt + 0.5)];
export const STEP_B: [number, number] = [T.deshalb, T.dritte - 0.4 - T.deshalb];
export const STEP_C: [number, number] = [T.dritte + 0.3, T.amEnde - 0.4 - (T.dritte + 0.3)];
const stepK = (t: number, s: [number, number]) => eio(clamp((t - s[0]) / s[1]));
export const sAt = (t: number) => [stepK(t, STEP_A), stepK(t, STEP_B), stepK(t, STEP_C)] as const;
export const rowsAt = (a: number, sA: number, sB: number, sC: number): [V3, V3, V3] => [
  Z1,
  sub(Z2, Z1, 2 * sA),
  sub(sub(Z3(a), Z1, sB), R2, sC),
];
export const rowsT = (t: number) => {
  const [sA, sB, sC] = sAt(t);
  return rowsAt(aAt(t), sA, sB, sC);
};

// Würfel [−½, ½]³ wird mit A(2) abgebildet; k = 0 → Würfel, k = 1 → Bild in der Ebene
export const FLAT: [number, number] = [T.drueckt + 0.4, T.ecken - 0.4 - (T.drueckt + 0.4)];
export const flatAt = (t: number) => eio(clamp((t - FLAT[0]) / FLAT[1]));
export const CUBE_H = 0.6;
// Die zwei Ecken auf der Kernrichtung (1, −1, 1): beide landen in 0
export const KERN_CORNERS: V3[] = [
  [CUBE_H, -CUBE_H, CUBE_H],
  [-CUBE_H, CUBE_H, -CUBE_H],
];
export const cubeMap = (t: number, x: V3): V3 => {
  const k = flatAt(t);
  const y = Ax(2, x);
  return [lerp(x[0], y[0], k), lerp(x[1], y[1], k), lerp(x[2], y[2], k)];
};

/* ---------- Sichtbarkeit ---------- */

export const vis = {
  stage: (t: number) => chain(t, 0, [[T.warum + 0.2, 1.1, 1], [T.merk - 0.2, 0.8, 0.12], [T.cta - 0.1, 0.8, 0]]),
  plane: (t: number) => chain(t, 0, [[T.ebene - 0.3, 0.9, 1]]),
  arrows: (t: number) => chain(t, 0, [[T.pfeile - 0.1, 0.6, 1], [T.drueckt - 0.1, 0.6, 0.22]]),
  // Höhenlinie des dritten Pfeils: ab „Deshalb“, bis der Pfeil verschwunden ist
  height: (t: number) => chain(t, 0, [[T.deshalb - 0.2, 0.5, 1], [STEP_C[0] + STEP_C[1] + 0.2, 0.5, 0.35], [SLIDE[0] + SLIDE[1] + 0.3, 0.4, 0]]),
  cube: (t: number) => chain(t, 0, [[T.drueckt - 0.3, 0.6, 1], [T.merk - 0.2, 0.6, 0.4]]),
};

/* ---------- Kamera ---------- */

// Orbit-Kamera mit deutlicher Perspektive. θ = Höhe über dem Boden, φ = Drehung um die senkrechte Achse (Grad),
// fw zeigt vom Blickpunkt zur Kamera. Die Kamera steht im Abstand DIST, u = Pixel pro Einheit am Blickpunkt.
export const DIST = 9;
const makeCamP = (theta: number, phi: number, cx: number, cy: number, u: number) => {
  const th = (theta * Math.PI) / 180;
  const ph = (phi * Math.PI) / 180;
  const r: V3 = [-Math.sin(ph), Math.cos(ph), 0];
  const up: V3 = [-Math.sin(th) * Math.cos(ph), -Math.sin(th) * Math.sin(ph), Math.cos(th)];
  const fw: V3 = [Math.cos(th) * Math.cos(ph), Math.cos(th) * Math.sin(ph), Math.sin(th)];
  return {
    p: (q: V3): V2 => {
      const depth = Math.max(0.6, DIST - dot(q, fw));
      const f = (u * DIST) / depth;
      return [cx + f * dot(q, r), cy - f * dot(q, up)];
    },
    depth: (q: V3) => DIST - dot(q, fw),
    fw,
    right: r,
    up,
  };
};

// Blick von der Seite oberhalb der Ebene (fw · n ≈ 0,37): Z₁ und Z₂ stehen im Bild etwa 16° auseinander,
// senkrechte Linien bleiben fast senkrecht (θ ≈ 30°).
const O = easeOutCubic;
export const camAt = (t: number) => {
  const th = chain(t, 62, [
    [T.warum, 2.6, 30, O], // Flug in den Raum
    [T.amEnde, 2.5, 24],
    [T.drueckt - 0.5, 2.5, 40],
  ]);
  const ph = chain(t, 10, [
    [T.warum, 2.6, 34, O],
    [T.warum + 2.6, 18, 46, (x) => x], // langsame Fahrt
    [T.amEnde, 2.5, 30],
    // Würfel: die lange Richtung des Bildes (≈ Z₂) liegt quer im Bild; beim Plattdrücken zoomt die Kamera heraus,
    // sonst verzerrt die Perspektive die vordere Ecke zu stark
    [T.drueckt - 0.5, 2.5, 38],
    [T.drueckt + 2, 12, 44, (x) => x],
  ]);
  const u = chain(t, 116, [
    [T.warum, 2.6, 126, O],
    [T.amEnde, 2.5, 150],
    [T.drueckt - 0.5, 2.5, 110],
    [FLAT[0], FLAT[1], 62],
  ]);
  const cy = chain(t, 1300, [[T.amEnde, 2.5, 1250], [T.drueckt - 0.5, 2.5, 1180]]);
  // Blickpunkt: zuerst Mitte der Pfeile, nach den Gauß-Schritten näher am Ursprung, beim Würfel Mitte des Bildes
  const tx = chain(t, 0.9, [[T.amEnde, 2.5, 0.3], [T.drueckt - 0.5, 2.5, 0], [FLAT[0], FLAT[1], 0.7]]);
  const ty = chain(t, 2.6, [[T.deshalb, 3, 2.0], [T.amEnde, 2.5, 1.0], [T.drueckt - 0.5, 2.5, 0], [FLAT[0], FLAT[1], 1.8]]);
  const tz = chain(t, 1.8, [[T.amEnde, 2.5, 1.3], [T.drueckt - 0.5, 2.5, 0], [FLAT[0], FLAT[1], 1.1]]);
  const base = makeCamP(th, ph, 520, cy, u);
  const rel = (q: V3): V3 => [q[0] - tx, q[1] - ty, q[2] - tz];
  const cam = {p: (q: V3) => base.p(rel(q)), depth: (q: V3) => base.depth(rel(q)), fw: base.fw, right: base.right, up: base.up};
  return {cam, th, ph, u};
};
export type KCam = ReturnType<typeof camAt>['cam'];

// Mathe-Punkt → Bildschirm
export const project = (t: number, p: V3) => camAt(t).cam.p(p);
