// Geometrie, Zustände und Kamera für „Für welche a ist A(a) invertierbar?“. Canvas und Overlays lesen beide nur von hier.
// Die drei Zeilen von A(a) sind Pfeile im Raum. Mathe-Koordinaten (x, y, z) liegen in der Welt bei (y, z, x):
// die mathematische x-Achse zeigt nach oben, die y-z-Ebene ist der Boden. (x, y, z) → (y, z, x) ist eine Drehung, keine Spiegelung.
import {V2, bump, clamp, easeInOutCubic, easeOutCubic, lerp} from '../math';
import {V3} from '../space';
import {T} from './timeline';

type Key = [number, number, number, ((x: number) => number)?];
// ab Zeit `at` in `dur` Sekunden weich auf den Wert `to`
export const chain = (t: number, v0: number, keys: Key[]) =>
  keys.reduce((v, [at, dur, to, ease = easeInOutCubic]) => lerp(v, to, ease(clamp((t - at) / dur))), v0);

const eio = easeInOutCubic;

/* ---------- Mathematik ---------- */

export const toWorld = (p: V3): V3 => [p[1], p[2], p[0]];
export const sub = (p: V3, q: V3, k = 1): V3 => [p[0] - k * q[0], p[1] - k * q[1], p[2] - k * q[2]];
export const addV = (p: V3, q: V3, k = 1): V3 => [p[0] + k * q[0], p[1] + k * q[1], p[2] + k * q[2]];
export const cross = (p: V3, q: V3): V3 => [p[1] * q[2] - p[2] * q[1], p[2] * q[0] - p[0] * q[2], p[0] * q[1] - p[1] * q[0]];
export const dot = (p: V3, q: V3) => p[0] * q[0] + p[1] * q[1] + p[2] * q[2];
export const det3 = (a: V3, b: V3, c: V3) => dot(a, cross(b, c));

export const R1: V3 = [1, 1, 1];
// Zeilen von A(a), nachdem s2·Z₁ von Z₂ und s3·Z₁ von Z₃ abgezogen wurde. Bei s2 = s3 = 1: (0, a−1, 0) und (0, 0, a−1).
export const rowsAt = (a: number, s2: number, s3: number): [V3, V3, V3] => [R1, sub([1, a, 1], R1, s2), sub([1, 1, a], R1, s3)];
// Das Abziehen ändert die Determinante nicht: det = (a−1)² für alle s2, s3
export const volume = (a: number) => (a - 1) * (a - 1);

/* ---------- Zustände über die Zeit ---------- */

// Beispielwert im Raum: a = −1. Dann stehen die Zeilen (1,1,1), (1,−1,1), (1,1,−1) etwa 70° auseinander,
// der Körper ist fast ein Würfel und hat das Volumen (−1−1)² = 4.
export const A_EX = -1;
// Im Hook −1 → 1 → −1; ab „a gegen eins laufen“ −1 → 1 (bei „nur noch ein Punkt“), Halt, dann weiter bis 3
export const A_HOOK = [T.eins - 0.15, 1.1] as const;
export const A_BACK = [T.einzige + 0.15, 1.0] as const;
export const SLIDE1: [number, number] = [T.laeuft + 0.6, T.punkt + 1.2 - (T.laeuft + 0.6)];
export const SLIDE2: [number, number] = [T.waechst - 0.1, T.nurBei + 1.4 - (T.waechst - 0.1)];
export const aAt = (t: number) =>
  chain(t, A_EX, [
    [A_HOOK[0], A_HOOK[1], 1],
    [A_BACK[0], A_BACK[1], A_EX],
    [SLIDE1[0], SLIDE1[1], 1, (x) => x],
    [SLIDE2[0], SLIDE2[1], 3, (x) => x],
  ]);

// Scherungen: Z₂ − Z₁ während „rutscht dabei genau entlang des ersten Pfeils“, Z₃ − Z₁ nach „dasselbe“
export const SHEAR2: [number, number] = [T.rutscht + 0.2, T.parallel + 1.2 - (T.rutscht + 0.2)];
export const SHEAR3: [number, number] = [T.dritten + 0.9, 2.2];
export const s2At = (t: number) => eio(clamp((t - SHEAR2[0]) / SHEAR2[1]));
export const s3At = (t: number) => eio(clamp((t - SHEAR3[0]) / SHEAR3[1]));
export const rowsT = (t: number) => rowsAt(aAt(t), s2At(t), s3At(t));

/* ---------- Sichtbarkeit ---------- */

export const vis = {
  // Bühne: im Hook ganz, während der Rechnung fast weg, im Warum-Teil wieder ganz
  stage: (t: number) => chain(t, 1, [[T.ueberall - 0.4, 0.9, 0.05], [T.warum + 0.1, 1.0, 1], [T.merk - 0.1, 0.8, 0.18], [T.cta - 0.1, 0.8, 0.06]]),
  body: (t: number) => chain(t, 0, [[0, 0.6, 1]]),
  // Deckkraft der Flächen: im Hook fast massiv; ab der Höhe halb durchsichtig, damit Pfeile und Flächen im Inneren sichtbar bleiben
  glass: (t: number) => chain(t, 0.9, [[T.abstand - 0.4, 0.6, 0.42], [T.dritten + 4.5, 0.8, 0.55]]),
  // Grundfläche (aus Z₁ und Z₃) und Höhe der zweiten Pfeilspitze
  base2: (t: number) => chain(t, 0, [[T.basis + 0.3, 0.6, 1], [T.dritten - 0.3, 0.5, 0]]),
  height2: (t: number) => chain(t, 0, [[T.abstand + 0.2, 0.6, 1], [T.dritten - 0.3, 0.5, 0]]),
  guide2: (t: number) => chain(t, 0, [[T.zieh + 1.6, 0.5, 1], [T.bleibt + 0.4, 0.6, 0]]),
  // Scherung von Z₃ (Grundfläche aus Z₁ und Z₂′)
  base3: (t: number) => chain(t, 0, [[T.dritten + 0.2, 0.5, 1], [SHEAR3[0] + SHEAR3[1] + 0.5, 0.5, 0]]),
  height3: (t: number) => chain(t, 0, [[T.dritten + 0.4, 0.4, 1], [SHEAR3[0] + SHEAR3[1] + 0.5, 0.5, 0]]),
  guide3: (t: number) => chain(t, 0, [[T.dritten + 0.4, 0.4, 1], [SHEAR3[0] + SHEAR3[1] + 0.3, 0.5, 0]]),
  // Quadrat am Boden und Höhe 1
  square: (t: number) => chain(t, 0, [[T.quadrat2 + 0.6, 0.6, 1], [T.merk - 0.2, 0.6, 0]]),
  height1: (t: number) => chain(t, 0, [[T.einsHoch - 0.1, 0.5, 1], [T.laeuft, 0.6, 0.0]]),
};

export const pulse = {
  r1: (t: number) => bump(t, T.pfeil + 0.1, 0.9) + bump(t, T.ersten, 1.0) + bump(t, T.rutscht + 1.4, 1.2) + bump(t, T.einsHoch, 1.0),
  r2: (t: number) => bump(t, T.pfeil + 0.35, 0.9) + bump(t, T.abstand + 1.0, 1.0) + bump(t, T.rutscht, 1.0),
  r3: (t: number) => bump(t, T.pfeil + 0.6, 0.9) + bump(t, T.dritten1, 1.0) + bump(t, T.dritten, 1.0),
};

/* ---------- Kamera ---------- */

// Orbit-Kamera mit deutlicher Perspektive. θ = Höhe über dem Boden, φ = Drehung um die senkrechte Achse (Grad),
// fw zeigt vom Blickpunkt zur Kamera. Die Kamera steht im Abstand DIST, u = Pixel pro Einheit am Blickpunkt.
export const DIST = 7.5;
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

// Blickwinkel bei den Scherungen (Grundfläche 30° schräg, Z₁ quer im Bild, die Höhe steht senkrecht dazu):
// Grundfläche aus Z₁, Z₃ hat in Welt die Normale (1, 0, −1) → φ = −90°, θ = 45°.
// Grundfläche aus Z₁, Z₂′ hat die Normale (0, −1, 1) → φ = 180°, θ = 45°.
const O = easeOutCubic;
export const camAt = (t: number) => {
  const th = chain(t, 55, [
    [0, 6.5, 18, O], // Hook: von oben herab
    [T.ueberall, 20, 26],
    [T.warum - 0.2, 0.01, 65],
    [T.warum, 3.0, 16, O], // Flug in den Raum
    [T.volumen, 5, 22],
    [T.gxh, 2.4, 45],
    [T.quadrat2, 2.0, 22],
    [T.laeuft, 2.0, 30],
    [T.waechst, 3.0, 28],
  ]);
  const ph = chain(t, 5, [
    [0, 6.5, 52, O],
    [6.5, 5, 75, (x) => x],
    [T.ueberall, 30, 140, (x) => x],
    [T.warum - 0.2, 0.01, -20],
    [T.warum, 3.0, 25, O],
    [T.koerper, 10, 70, (x) => x], // langsame Umrundung
    [T.gxh, 2.4, -90], // Fahrt zur Ansicht der Grundfläche
    [T.zieh, 13, -82, (x) => x],
    [T.dritten, 2.2, -180], // Fahrt um den Körper zur zweiten Grundfläche
    [T.dritten + 2.2, 3, -172, (x) => x],
    // nie genau über eine Ecke des Quadrats (φ ≡ 45° mod 90°), sonst wirkt der Quader wie ein flaches Sechseck
    [T.quadrat2, 2.0, -168],
    [T.quadrat2 + 2, 9, -152, (x) => x], // langsame Fahrt am Körper mit Höhe 1 entlang
    [T.laeuft, 2.0, -162],
    [T.laeuft + 2, 18, -148, (x) => x],
  ]);
  const u = chain(t, 140, [
    [0, 6.5, 172, O],
    [T.warum, 3.0, 160, O],
    [T.gxh, 2.4, 128],
    [T.quadrat2, 2.0, 165],
    [T.laeuft, 2.0, 150],
  ]);
  const cy = chain(t, 1185, [[T.warum, 3.0, 1190], [T.gxh, 2.4, 1170], [T.quadrat2, 2, 1180]]);
  // Blickpunkt (Welt): Mitte des Körpers. Bei a = −1 (0,5; 0,5; 1,5), nach beiden Scherungen (−0,5; −0,5; 0,5)
  const tx = chain(t, 0.5, [[T.gxh, 2.4, 0.0], [T.dritten, 2.2, -0.4], [T.quadrat2, 2.0, -0.5], [T.laeuft, 2.0, -0.3], [T.waechst, 3.0, 0.6]]);
  const ty = chain(t, 0.5, [[T.gxh, 2.4, 0.3], [T.dritten, 2.2, -0.2], [T.quadrat2, 2.0, -0.5], [T.laeuft, 2.0, -0.3], [T.waechst, 3.0, 0.6]]);
  const tz = chain(t, 1.4, [[T.gxh, 2.4, 1.1], [T.dritten, 2.2, 0.8], [T.quadrat2, 2.0, 0.5], [T.laeuft, 2.0, 0.5]]);
  const base = makeCamP(th, ph, 540, cy, u);
  const rel = (q: V3): V3 => [q[0] - tx, q[1] - ty, q[2] - tz];
  const cam = {p: (q: V3) => base.p(rel(q)), depth: (q: V3) => base.depth(rel(q)), fw: base.fw, right: base.right, up: base.up};
  return {cam, th, ph, u};
};
export type KCam = ReturnType<typeof camAt>['cam'];

// Mathe-Punkt → Bildschirm
export const project = (t: number, p: V3) => camAt(t).cam.p(toWorld(p));
