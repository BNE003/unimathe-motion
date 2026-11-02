import {FPS} from './theme';

export type V2 = [number, number];
export type M2 = [[number, number], [number, number]];

// Beispielmatrix: Eigenvektoren (1,1) mit λ = 3 und (1,-1) mit λ = 1
export const A: M2 = [[2, 1], [1, 2]];

export const mul = (M: M2, p: V2): V2 => [M[0][0] * p[0] + M[0][1] * p[1], M[1][0] * p[0] + M[1][1] * p[1]];

// (1-t)·I + t·M: jeder Eigenvektor von M bleibt in jedem Zwischenbild auf seiner Linie
export const lerpM = (M: M2, t: number): M2 => [
  [1 + t * (M[0][0] - 1), t * M[0][1]],
  [t * M[1][0], 1 + t * (M[1][1] - 1)],
];

export const scale = (p: V2, k: number): V2 => [p[0] * k, p[1] * k];
export const add = (p: V2, q: V2): V2 => [p[0] + q[0], p[1] + q[1]];
export const angleDeg = (p: V2) => (Math.atan2(p[1], p[0]) * 180) / Math.PI;
export const len = (p: V2) => Math.hypot(p[0], p[1]);

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeInCubic = (t: number) => t * t * t;

// Feder mit ca. 6 % Überschwingen: e^(-aπ/b) ≈ 0,06
const SA = 8.96;
const SB = 10;
export const springOS = (t: number) => {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return 1 - Math.exp(-SA * t) * (Math.cos(SB * t) + (SA / SB) * Math.sin(SB * t));
};

// Fortschritt 0..1 zwischen start und start + dur (Sekunden)
export const prog = (sec: number, start: number, dur: number, ease: (t: number) => number = easeInOutCubic) =>
  ease(clamp((sec - start) / dur));

// kurzer Impuls 0 → 1 → 0, z. B. für Glow beim Einrasten
export const bump = (sec: number, at: number, dur: number) => {
  const x = (sec - at) / dur;
  if (x <= 0 || x >= 1) return 0;
  return Math.sin(Math.PI * x) * (1 - x * 0.4);
};

export const sec = (s: number) => Math.round(s * FPS);

export type View = {ox: number; oy: number; u: number};
export const toScreen = (v: View, p: V2): V2 => [v.ox + v.u * p[0], v.oy - v.u * p[1]];
export const lerpView = (a: View, b: View, t: number): View => ({
  ox: lerp(a.ox, b.ox, t),
  oy: lerp(a.oy, b.oy, t),
  u: lerp(a.u, b.u, t),
});

export const fmtDe = (x: number, digits = 1) => x.toFixed(digits).replace('.', ',');
