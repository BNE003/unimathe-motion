// Mathematik, Zustände und Kamera für „Die dominante Eigenrichtung“. Canvas und Overlays lesen beide nur von hier.
// Die Ebene der 2×2-Matrix steht senkrecht im Raum: Mathe-Punkt (x, y) liegt bei Welt (x, 0, y).
// Die x-Achse liegt auf dem Glasboden, „oben“ ist wirklich oben.
import {V2, clamp, easeInOutCubic, easeOutCubic, lerp} from '../math';
import {V3, makeCam} from '../space';
import {T} from './timeline';

export const W3 = (p: V2, lift = 0): V3 => [p[0], lift, p[1]];

type Key = [number, number, number, ((x: number) => number)?];
// ab Zeit `at` in `dur` Sekunden weich auf den Wert `to`
export const chain = (t: number, v0: number, keys: Key[]) =>
  keys.reduce((v, [at, dur, to, ease = easeInOutCubic]) => lerp(v, to, ease(clamp((t - at) / dur))), v0);

const rad = (d: number) => (d * Math.PI) / 180;
const sine = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * x);

/* ---------- Matrix A = diag(2, 1) ---------- */

// n-fache Anwendung, auch für gebrochene n: zwischen Aⁿv und Aⁿ⁺¹v wird linear interpoliert,
// also x-Faktor 2^⌊n⌋ · (1 + Bruchteil). Jeder angezeigte Zustand liegt auf der Strecke zwischen zwei echten Zuständen.
export const xFactor = (n: number) => {
  const k = Math.floor(n);
  return Math.pow(2, k) * (1 + (n - k));
};
export const applyN = (v: V2, n: number): V2 => [v[0] * xFactor(n), v[1]];
const norm = (v: V2): V2 => {
  const l = Math.hypot(v[0], v[1]);
  return [v[0] / l, v[1] / l];
};

/* ---------- Fächer ---------- */

// Startrichtungen in Grad: alle mit x ≠ 0, links und rechts, 45° ist der hervorgehobene Vektor (1, 1)
export const FAN_DEG = [12, 24, 34, 45, 56, 67, 78, 102, 113, 124, 135, 146, 156, 168];
export const HL = FAN_DEG.indexOf(45);
export const FAN_DIR: V2[] = FAN_DEG.map((d) => [Math.cos(rad(d)), Math.sin(rad(d))]);
export const FAN_LEN = 3; // angezeigte Länge im Fächer (nach jedem Schritt normiert)

// Die Matrix schwebt über dem Fächer; von hier läuft jede Transformationswelle los
export const M_ANCHOR: V3 = [0, 0, 4.35];
export const WAVE_SPEED = 10;
export const STEP_D = 0.42;
// jeder Vektor wird umgerechnet, wenn die Welle seine Spitze erreicht
export const DELAY = FAN_DIR.map((d) => {
  const tip = W3([d[0] * FAN_LEN, d[1] * FAN_LEN]);
  const dist = Math.hypot(tip[0] - M_ANCHOR[0], tip[1] - M_ANCHOR[1], tip[2] - M_ANCHOR[2]);
  return Math.max(0, dist - 1.1) / WAVE_SPEED;
});

// Impulse im Hook und im großen Reveal
// drei deutliche Impulse, dann immer dichter (Abstand ≥ STEP_D, damit sich Schritte eines Vektors nie überlappen)
export const HOOK_P = [0.06, 0.86, 1.56, 2.21, 2.76, 3.26, 3.71].map((d) => T.anwende + d);
export const REV_P = [T.gestreckt + 0.55, T.nicht + 0.05, T.vertR + 0.1, T.dominiert + 0.15, T.dominiert + 0.85, T.deshalb2 + 0.2, T.deshalb2 + 0.8, T.deshalb2 + 1.35, T.deshalb2 + 1.85];

const eio = easeInOutCubic;
const pulsesDone = (t: number, P: number[], delay: number) => P.reduce((n, p) => n + eio(clamp((t - p - delay) / STEP_D)), 0);

// Rücklauf des hervorgehobenen Vektors bei „Warum?“
export const REWIND = T.warum + 0.15;
export const REWIND_D = 1.4;
export const rewindP = (t: number) => eio(clamp((t - REWIND) / REWIND_D));

// angezeigter Fächervektor i zur Zeit t (normierte Richtung mal Länge)
export const fanVec = (i: number, t: number): V2 => {
  const reveal = t > T.genau;
  const n = reveal ? pulsesDone(t, REV_P, DELAY[i]) : pulsesDone(t, HOOK_P, DELAY[i]) * (i === HL ? 1 - rewindP(t) : 1);
  const d = norm(applyN(FAN_DIR[i], n));
  // der hervorgehobene Vektor schrumpft beim Rücklauf auf seine echte Länge |(1, 1)|
  const L = !reveal && i === HL ? lerp(FAN_LEN, Math.SQRT2, rewindP(t)) : FAN_LEN;
  return [d[0] * L, d[1] * L];
};
export const hookN = (t: number) => pulsesDone(t, HOOK_P, 0);
export const revN = (t: number) => pulsesDone(t, REV_P, 0);

/* ---------- ein einzelner Vektor (echte Längen) ---------- */

// drei Anwendungen: (1, 1) → (2, 1) → (4, 1) → (8, 1)
export const SINGLE_P: [number, number][] = [
  [T.verdoppelt + 0.05, 0.9],
  [T.vier - 0.3, 0.75],
  [T.acht - 0.3, 0.75],
];
export const singleN = (t: number) => SINGLE_P.reduce((n, [p, d]) => n + eio(clamp((t - p) / d)), 0);
export const singleVec = (t: number): V2 => [xFactor(singleN(t)), 1];
export const STATES: V2[] = [[1, 1], [2, 1], [4, 1], [8, 1]];

/* ---------- Eigenvektoren im Reveal ---------- */

export const EIG_H0 = 0.45; // Startlänge des horizontalen Eigenvektors (wird je Schritt verdoppelt)
export const EIG_V0 = 1.6; // vertikaler Eigenvektor, Faktor 1
export const eigH = (t: number): V2 => [EIG_H0 * xFactor(revN(t)), 0];

/* ---------- Sichtbarkeit ---------- */

export const vis = {
  fan: (t: number) => chain(t, 1, [[T.warum + 0.1, 0.9, 0], [T.genau + 0.35, 1.0, 1], [T.cta - 0.2, 0.8, 0]]),
  hl: (t: number) => chain(t, 1, [[T.genau, 0.6, 0]]),
  floor: (t: number) => chain(t, 1, [[T.warum + 0.2, 1.2, 0.55], [T.genau, 1.4, 1], [T.cta - 0.2, 0.8, 0.15]]),
  plane: (t: number) => chain(t, 0, [[T.warum + 0.4, 1.2, 1], [T.genau, 1.0, 0]]),
  compA: (t: number) => chain(t, 0, [[T.anteilen + 0.15, 0.6, 1], [T.genau, 0.6, 0]]),
  compC: (t: number) => chain(t, 0, [[T.anteilen + 0.65, 0.6, 1], [T.genau, 0.6, 0]]),
  ghosts: (t: number) => chain(t, 1, [[T.hAnteil - 0.2, 0.6, 0.35], [T.genau, 0.6, 0]]),
  axis: (t: number) => chain(t, 0.35, [[T.eigen - 0.1, 0.6, 1], [T.cta - 0.2, 0.8, 0.2]]),
  eigH: (t: number) => chain(t, 0, [[T.eigen + 0.3, 0.5, 1], [T.cta - 0.2, 0.6, 0]]),
  eigV: (t: number) => chain(t, 0, [[T.weil + 0.2, 0.5, 1], [T.cta - 0.2, 0.6, 0]]),
  stage: (t: number) => chain(t, 1, [[T.cta - 0.1, 0.8, 0.1]]),
  // Matrix: 0 = im Raum über dem Fächer, 1 = fester Platz oben im Bild während der Einzelerklärung
  mSlot: (t: number) => chain(t, 0, [[T.warum, 1.5, 1], [T.genau, 1.6, 0]]),
  matrix: (t: number) => chain(t, 0.0, [[0, 0.5, 1], [T.cta - 0.3, 0.6, 0]]),
};

/* ---------- Kamera ---------- */

const O = easeOutCubic;
export const camAt = (t: number) => {
  const sx = singleVec(t)[0];
  const th = chain(t, 12, [
    [0, 4.2, 17, O],
    [HOOK_P[0], T.linie + 0.6 - HOOK_P[0], 11],
    [REWIND, REWIND_D + 0.3, 8],
    [T.genau, 2.2, 21],
    [T.gestreckt, 6, 11],
    [T.dominiert, 6.5, 17, sine],
  ]);
  const ph = chain(t, -150, [
    [0, 4.2, -114, O],
    [HOOK_P[0], T.linie + 0.6 - HOOK_P[0], -95],
    [REWIND, REWIND_D + 0.3, -99],
    [T.genau, 2.2, -122],
    [T.gestreckt, 6, -101],
    [T.dominiert, 6.5, -82, sine],
  ]);
  // Einzelvektor: Zoom folgt der echten Länge, damit (8, 1) ganz ins Bild passt
  const uSingle = clamp(860 / (sx + 0.9), 100, 330);
  const kS = chain(t, 0, [[REWIND, REWIND_D + 0.3, 1], [T.genau, 2.2, 0]]);
  const uWorld = chain(t, 240, [[0, 4.2, 178, O], [HOOK_P[0], T.linie + 0.6 - HOOK_P[0], 152], [T.genau, 2.2, 150], [T.dominiert, 6.5, 138]]);
  const u = lerp(uWorld, uSingle, kS);
  const tgS: V3 = [sx * 0.5 + 0.05, 0, 0.55];
  const tgW: V3 = [
    chain(t, 0.7, [[0, 4.2, 0, O], [T.gestreckt, 6, 1.0], [T.dominiert, 6.5, 0.3, sine]]),
    0,
    chain(t, 1.15, [[0, 4.2, 2.05, O], [HOOK_P[0], T.linie + 0.6 - HOOK_P[0], 1.9], [T.genau, 2.2, 1.55], [T.gestreckt, 6, 1.35]]),
  ];
  const tg: V3 = [lerp(tgW[0], tgS[0], kS), 0, lerp(tgW[2], tgS[2], kS)];
  const cy = lerp(chain(t, 1000, [[T.genau, 2.2, 1000]]), 1160, kS);
  const base = makeCam(th, ph, 540, cy, u);
  const rel = (q: V3): V3 => [q[0] - tg[0], q[1] - tg[1], q[2] - tg[2]];
  const cam = {p: (q: V3) => base.p(rel(q)), depth: (q: V3) => base.depth(rel(q))};
  return {cam, th, ph, u, kS};
};
export type ECam = ReturnType<typeof camAt>['cam'];

export const project = (t: number, q: V3): V2 => camAt(t).cam.p(q);
