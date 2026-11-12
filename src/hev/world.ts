// Geometrie, Regler und Kamera für „So berechnest du Eigenvektoren einer 3×3-Matrix“.
// A = (2 1 0; 1 2 0; 0 0 3), det(A − λI) = (1 − λ)(3 − λ)².
// E₁ = span{(−1, 1, 0)} (Gerade im Boden), E₃ = span{(1, 1, 0), (0, 0, 1)} (die senkrechte Wand x = y).
// Beide stehen senkrecht aufeinander, weil A symmetrisch ist.
import {bump, clamp, easeInOutCubic, lerp} from '../math';
import {V3, add3, makeCam, sc3} from '../space';
import {C} from '../theme';
import {T} from './timeline';

type Key = [number, number, number, ((x: number) => number)?];
// ab Zeit `at` in `dur` Sekunden weich auf den Wert `to`
export const chain = (t: number, v0: number, keys: Key[]) =>
  keys.reduce((v, [at, dur, to, ease = easeInOutCubic]) => lerp(v, to, ease(clamp((t - at) / dur))), v0);
const sine = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x);

// Farben der Serie und dieses Videos
export const K = {
  lam: C.eig, // λ allgemein
  l1: C.cyan, // alles zu λ = 1
  l3: '#B49BFF', // alles zu λ = 3, auch der Regler s
  t3: '#FF8AD8', // zweiter Regler t bei λ = 3
  mint: '#5EEAB5', // Serienfarbe „So geht's“
  warn: '#FFB25C',
};

/* ---------- Mathematik ---------- */

export const A3 = [
  [2, 1, 0],
  [1, 2, 0],
  [0, 0, 3],
];
export const mulA = (v: V3): V3 => A3.map((r) => r[0] * v[0] + r[1] * v[1] + r[2] * v[2]) as V3;
export const E1: V3 = [-1, 1, 0];
export const B1: V3 = [1, 1, 0];
export const B2: V3 = [0, 0, 1];

/* ---------- Regler ---------- */

// λ = 1: Regler t für y. Erst „beliebig wählen“, dann im Raum einmal ganz durchfahren
export const SWEEP1: [number, number] = [T.einRegler - 0.05, 2.6];
export const tReg1 = (t: number) =>
  chain(t, 1, [
    [T.beliebig - 0.1, 0.65, 2],
    [T.beliebig + 0.6, 0.85, -1.5],
    [T.beliebig + 1.5, 0.7, 1],
    [SWEEP1[0], 0.8, -1.8],
    [SWEEP1[0] + 0.8, 1.4, 1.8],
    [SWEEP1[0] + 2.2, 0.6, 1],
  ]);
// λ = 3: Regler s (für y) und t (für z). s fährt zuerst, dann t
export const SWEEP_S: [number, number] = [T.zwei2 - 0.05, 2.1];
export const SWEEP_T: [number, number] = [T.richtungen2 + 0.25, 2.4];
export const sReg3 = (t: number) =>
  chain(t, 1, [
    [SWEEP_S[0], 0.6, -1.5],
    [SWEEP_S[0] + 0.6, 1.0, 1.5],
    [SWEEP_S[0] + 1.6, 0.5, 0.8],
  ]);
export const tReg3 = (t: number) =>
  chain(t, 1, [
    [SWEEP_T[0], 0.6, -0.9],
    [SWEEP_T[0] + 0.6, 1.2, 1.7],
    [SWEEP_T[0] + 1.8, 0.6, 0.7],
  ]);

// bisher erreichte Extremwerte eines Reglers ab `from` (für die Spur im Raum)
const span = (f: (t: number) => number, from: number, t: number): [number, number] => {
  let lo = f(from);
  let hi = lo;
  for (let x = from; x <= t; x += 1 / 60) {
    const v = f(x);
    lo = Math.min(lo, v);
    hi = Math.max(hi, v);
  }
  return [lo, hi];
};
export const trace1 = (t: number): [number, number] => (t < SWEEP1[0] ? [1, 1] : span(tReg1, SWEEP1[0], t));
export const traceS = (t: number): [number, number] => (t < SWEEP_S[0] ? [1, 1] : span(sReg3, SWEEP_S[0], Math.min(t, SWEEP_S[0] + SWEEP_S[1])));
export const traceT = (t: number): [number, number] => (t < SWEEP_T[0] ? [1, 1] : span(tReg3, SWEEP_T[0], Math.min(t, SWEEP_T[0] + SWEEP_T[1])));

// Vektoren der Ebene, die A verdreifacht, und ein Vektor der Geraden, der bleibt
export const TRIPLE: [number, number] = [T.verdreifacht - 0.55, 1.3];
export const W3: V3[] = [
  add3(sc3(B1, 0.55), sc3(B2, 0.45)),
  add3(sc3(B1, -0.5), sc3(B2, 0.5)),
  add3(sc3(B1, 0.35), sc3(B2, -0.38)),
];
export const W1: V3 = sc3(E1, 0.75);
export const kTriple = (t: number) => lerp(1, 3, easeInOutCubic(clamp((t - TRIPLE[0]) / TRIPLE[1])));

/* ---------- Sichtbarkeit ---------- */

// Raum 1 (Gerade) nach „z gleich null“, Raum 2 (Ebene) nach „linear unabhängig“
export const STAGE1: [number, number] = [T.zNull + 0.95, 0.7];
export const STAGE1_OUT = T.l3 - 0.75;
export const STAGE2: [number, number] = [T.zwei2 - 0.75, 0.7];

export const vis = {
  stage: (t: number) =>
    chain(t, 0, [
      [STAGE1[0], STAGE1[1], 1],
      [STAGE1_OUT, 0.5, 0],
      [STAGE2[0], STAGE2[1], 1],
      [T.rezept - 0.2, 0.6, 0.18],
      [T.cta, 0.5, 0],
    ]),
  // Gerade E₁: entsteht beim Durchfahren, bleibt im Ebenen-Raum schwach sichtbar
  line1: (t: number) => chain(t, 0, [[SWEEP1[0] + 0.1, 0.3, 1], [STAGE2[0], 0.1, 0.55]]),
  arrow1: (t: number) => chain(t, 0, [[STAGE1[0] + 0.2, 0.5, 1], [STAGE1_OUT, 0.3, 0]]),
  plane: (t: number) => chain(t, 0, [[SWEEP_S[0] + 0.1, 0.3, 1]]),
  arrow3: (t: number) => chain(t, 0, [[STAGE2[0] + 0.2, 0.5, 1], [TRIPLE[0] - 0.9, 0.5, 0]]),
  // Zerlegung s·b₁ + t·b₂ als Parallelogramm-Weg
  parts: (t: number) => chain(t, 0, [[STAGE2[0] + 0.4, 0.5, 1], [TRIPLE[0] - 0.9, 0.5, 0]]),
  samples: (t: number) => chain(t, 0, [[TRIPLE[0] - 0.7, 0.5, 1], [T.rezept - 0.2, 0.5, 0.4]]),
  axes: (t: number) => chain(t, 0, [[STAGE1[0], 0.6, 1]]),
};

export const planeFlash = (t: number) => bump(t, T.ebene, 1.3) + bump(t, T.eigenraum, 1.0) * 0.5;

/* ---------- Kamera ---------- */

// Raum 1: Blick wie im Lehrbuch (x nach vorn links, y nach rechts, z nach oben), die Gerade liegt quer im Bild.
// Raum 2: um die z-Achse gedreht, sodass man schräg auf die Wand x = y schaut und die Gerade sie durchsticht.
export const camAt = (t: number) => {
  const th = chain(t, 17, [[STAGE2[0] - 1, 0.5, 15], [T.rezept, 3, 19, sine]]);
  const ph = chain(t, 26, [
    [STAGE1[0], 4.5, 34, sine],
    [STAGE2[0] - 1, 0.5, -34],
    [STAGE2[0], 9, -12, sine],
    [T.doppelter, 6, -20, sine],
  ]);
  const u = chain(t, 150, [[STAGE2[0] - 1, 0.5, 146]]);
  const cy = chain(t, 1110, [[STAGE2[0] - 1, 0.5, 1212]]);
  const cam = makeCam(th, ph, 540, cy, u);
  return {cam, th, ph, u};
};
export type HCam = ReturnType<typeof camAt>['cam'];
export const project = (t: number, q: V3) => camAt(t).cam.p(q);
